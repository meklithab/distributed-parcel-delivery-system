import { Request, Response } from 'express';
import prisma from '../config/database';

/**
 * Pricing Rules stored as constants (fallback if DB rules not found)
 */
const DEFAULT_PRICING_RULES = {
    baseFee: 100, // Base delivery fee in ETB
    weightPerKg: 10, // Fee per kg
    distancePerKm: 5, // Fee per km
    priorityMultipliers: {
        STANDARD: 1,
        EXPRESS: 1.5,
        SAME_DAY: 2
    },
    serviceTypeMultipliers: {
        DOOR_TO_DOOR: 1,
        PICKUP_STATION: 0.8,
        LOCKER: 0.7
    },
    fragileMultiplier: 1.2,
    perishableMultiplier: 1.3,
    signatureMultiplier: 1.1,
    insuranceRate: 0.02, // 2% of declared value
    taxRate: 0.15 // 15% VAT
};

/**
 * Get pricing rules from database with fallback to defaults
 */
const getPricingRules = async () => {
    try {
        const rules = await prisma.pricingRule.findMany({
            where: { is_active: true }
        });

        if (rules.length === 0) {
            return DEFAULT_PRICING_RULES;
        }

        // Build rules object from DB
        const dbRules: any = { ...DEFAULT_PRICING_RULES };

        for (const rule of rules) {
            switch (rule.rule_type) {
                case 'BASE_FEE':
                    dbRules.baseFee = Number(rule.numeric_value);
                    break;
                case 'WEIGHT_FEE':
                    dbRules.weightPerKg = Number(rule.numeric_value);
                    break;
                case 'DISTANCE_FEE':
                    dbRules.distancePerKm = Number(rule.numeric_value);
                    break;
                case 'PRIORITY_STANDARD':
                    dbRules.priorityMultipliers.STANDARD = Number(rule.numeric_value);
                    break;
                case 'PRIORITY_EXPRESS':
                    dbRules.priorityMultipliers.EXPRESS = Number(rule.numeric_value);
                    break;
                case 'PRIORITY_SAME_DAY':
                    dbRules.priorityMultipliers.SAME_DAY = Number(rule.numeric_value);
                    break;
                case 'SERVICE_DOOR_TO_DOOR':
                    dbRules.serviceTypeMultipliers.DOOR_TO_DOOR = Number(rule.numeric_value);
                    break;
                case 'SERVICE_PICKUP_STATION':
                    dbRules.serviceTypeMultipliers.PICKUP_STATION = Number(rule.numeric_value);
                    break;
                case 'SERVICE_LOCKER':
                    dbRules.serviceTypeMultipliers.LOCKER = Number(rule.numeric_value);
                    break;
                case 'FRAGILE_MULTIPLIER':
                    dbRules.fragileMultiplier = Number(rule.numeric_value);
                    break;
                case 'PERISHABLE_MULTIPLIER':
                    dbRules.perishableMultiplier = Number(rule.numeric_value);
                    break;
                case 'SIGNATURE_MULTIPLIER':
                    dbRules.signatureMultiplier = Number(rule.numeric_value);
                    break;
                case 'INSURANCE_RATE':
                    dbRules.insuranceRate = Number(rule.numeric_value);
                    break;
                case 'TAX_RATE':
                    dbRules.taxRate = Number(rule.numeric_value);
                    break;
            }
        }

        return dbRules;
    } catch (error) {
        console.error('Failed to fetch pricing rules from DB, using defaults:', error);
        return DEFAULT_PRICING_RULES;
    }
};

/**
 * Calculate delivery fee based on order parameters
 */
export const calculateDeliveryFee = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            orderId,
            priority = 'STANDARD',
            serviceType = 'DOOR_TO_DOOR',
            vehicleType,
            distanceKm,
            parcels = []
        } = req.body;

        if (!parcels || !Array.isArray(parcels) || parcels.length === 0) {
            res.status(400).json({ message: 'At least one parcel is required' });
            return;
        }

        // Get pricing rules
        const rules = await getPricingRules();

        // Calculate total weight
        let totalWeight = 0;
        let parcelModifiers = 1;
        let insuranceFee = 0;

        for (const parcel of parcels) {
            totalWeight += Number(parcel.weightKg) || 0;
            if (parcel.isFragile) parcelModifiers *= rules.fragileMultiplier;
            if (parcel.isPerishable) parcelModifiers *= rules.perishableMultiplier;
            if (parcel.requiresSignature) parcelModifiers *= rules.signatureMultiplier;
            if (parcel.declaredValue) {
                insuranceFee += Number(parcel.declaredValue) * rules.insuranceRate;
            }
        }

        // Calculate fees
        const baseFee = rules.baseFee;
        const weightFee = totalWeight * rules.weightPerKg;
        const distanceFee = distanceKm ? Number(distanceKm) * rules.distancePerKm : 0;
        const priorityMultiplier = rules.priorityMultipliers[priority as keyof typeof rules.priorityMultipliers] || 1;
        const serviceMultiplier = rules.serviceTypeMultipliers[serviceType as keyof typeof rules.serviceTypeMultipliers] || 1;
        const vehicleMultiplier = vehicleType === 'MOTORCYCLE' ? 1 : vehicleType === 'CAR' ? 1.5 : vehicleType === 'VAN' ? 2 : 1;

        const subtotal = (baseFee + weightFee + distanceFee) * priorityMultiplier * serviceMultiplier * parcelModifiers * vehicleMultiplier;
        const taxAmount = subtotal * rules.taxRate;
        const totalAmount = Number((subtotal + taxAmount + insuranceFee).toFixed(2));

        // Store calculation if orderId is provided
        let calculationId = null;
        if (orderId) {
            try {
                const calculation = await prisma.deliveryFeeCalculation.create({
                    data: {
                        order_id: orderId,
                        base_fee: baseFee,
                        distance_km: distanceKm || null,
                        distance_fee: distanceFee || null,
                        vehicle_type: vehicleType || null,
                        vehicle_multiplier: vehicleMultiplier,
                        priority_level: priority,
                        priority_multiplier: priorityMultiplier,
                        surge_multiplier: 1, // Could be dynamic based on demand
                        weight_kg: totalWeight,
                        weight_surcharge: weightFee,
                        subtotal: subtotal,
                        tax_rate: rules.taxRate,
                        tax_amount: taxAmount,
                        total_amount: totalAmount,
                        calculation_parameters: {
                            parcels,
                            serviceType,
                            parcelModifiers,
                            insuranceFee,
                            rules: {
                                baseFee: rules.baseFee,
                                weightPerKg: rules.weightPerKg
                            }
                        },
                        is_applied: false,
                        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiry
                    }
                });
                calculationId = calculation.calculation_id;
                console.log(`📊 Stored delivery fee calculation ${calculationId} for order ${orderId}`);
            } catch (dbError) {
                console.error('Failed to store calculation:', dbError);
                // Continue without storing
            }
        }

        res.json({
            calculationId,
            estimatedPrice: totalAmount,
            breakdown: {
                baseFee,
                weightFee,
                totalWeight,
                distanceFee,
                distanceKm: distanceKm || 0,
                priorityMultiplier,
                serviceMultiplier,
                vehicleMultiplier,
                parcelModifiers,
                insuranceFee,
                subtotal: Number(subtotal.toFixed(2)),
                taxRate: rules.taxRate,
                taxAmount: Number(taxAmount.toFixed(2)),
                total: totalAmount,
                currency: 'ETB'
            },
            expiresAt: calculationId ? new Date(Date.now() + 30 * 60 * 1000) : null
        });
    } catch (error) {
        console.error('Calculate delivery fee error:', error);
        res.status(500).json({ message: 'Server error', error: String(error) });
    }
};

/**
 * Get pricing rules (for display purposes)
 */
export const getPricingRulesEndpoint = async (req: Request, res: Response): Promise<void> => {
    try {
        const rules = await getPricingRules();
        res.json({
            baseFee: rules.baseFee,
            weightPerKg: rules.weightPerKg,
            distancePerKm: rules.distancePerKm,
            priorityMultipliers: rules.priorityMultipliers,
            serviceTypeMultipliers: rules.serviceTypeMultipliers,
            handlingFees: {
                fragile: `+${((rules.fragileMultiplier - 1) * 100).toFixed(0)}%`,
                perishable: `+${((rules.perishableMultiplier - 1) * 100).toFixed(0)}%`,
                signature: `+${((rules.signatureMultiplier - 1) * 100).toFixed(0)}%`
            },
            insuranceRate: `${(rules.insuranceRate * 100).toFixed(0)}% of declared value`,
            taxRate: `${(rules.taxRate * 100).toFixed(0)}%`,
            currency: 'ETB'
        });
    } catch (error) {
        console.error('Get pricing rules error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get stored calculation for an order
 */
export const getOrderCalculation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        const calculation = await prisma.deliveryFeeCalculation.findFirst({
            where: { order_id: orderId },
            orderBy: { created_at: 'desc' }
        });

        if (!calculation) {
            res.status(404).json({ message: 'No calculation found for this order' });
            return;
        }

        res.json(calculation);
    } catch (error) {
        console.error('Get order calculation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
