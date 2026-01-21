
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding pricing rules...');

    const rules = [
        {
            rule_name: 'Base Delivery Fee',
            rule_type: 'BASE_FEE',
            numeric_value: 100.00,
            description: 'Base fee for all deliveries in ETB'
        },
        {
            rule_name: 'Weight Fee Per KG',
            rule_type: 'WEIGHT_FEE',
            numeric_value: 10.00,
            description: 'Fee per KG of weight'
        },
        {
            rule_name: 'Distance Fee Per KM',
            rule_type: 'DISTANCE_FEE',
            numeric_value: 5.00,
            description: 'Fee per KM of distance'
        },
        {
            rule_name: 'Priority Standard',
            rule_type: 'PRIORITY_STANDARD',
            numeric_value: 1.00,
            description: 'Multiplier for standard delivery'
        },
        {
            rule_name: 'Priority Express',
            rule_type: 'PRIORITY_EXPRESS',
            numeric_value: 1.50,
            description: 'Multiplier for express delivery (+50%)'
        },
        {
            rule_name: 'Priority Same Day',
            rule_type: 'PRIORITY_SAME_DAY',
            numeric_value: 2.00,
            description: 'Multiplier for same day delivery (+100%)'
        },
        {
            rule_name: 'Service Door to Door',
            rule_type: 'SERVICE_DOOR_TO_DOOR',
            numeric_value: 1.00,
            description: 'Multiplier for door to door service'
        },
        {
            rule_name: 'Service Pickup Station',
            rule_type: 'SERVICE_PICKUP_STATION',
            numeric_value: 0.80,
            description: 'Multiplier for pickup station (-20%)'
        },
        {
            rule_name: 'Service Locker',
            rule_type: 'SERVICE_LOCKER',
            numeric_value: 0.70,
            description: 'Multiplier for locker service (-30%)'
        },
        {
            rule_name: 'Fragile Multiplier',
            rule_type: 'FRAGILE_MULTIPLIER',
            numeric_value: 1.20,
            description: 'Fee multiplier for fragile items (+20%)'
        },
        {
            rule_name: 'Perishable Multiplier',
            rule_type: 'PERISHABLE_MULTIPLIER',
            numeric_value: 1.30,
            description: 'Fee multiplier for perishable items (+30%)'
        },
        {
            rule_name: 'Signature Multiplier',
            rule_type: 'SIGNATURE_MULTIPLIER',
            numeric_value: 1.10,
            description: 'Fee multiplier for signature required (+10%)'
        },
        {
            rule_name: 'Insurance Rate',
            rule_type: 'INSURANCE_RATE',
            numeric_value: 0.02,
            description: 'Insurance rate (2% of declared value)'
        },
        {
            rule_name: 'Tax Rate',
            rule_type: 'TAX_RATE',
            numeric_value: 0.15,
            description: 'VAT Rate (15%)'
        }
    ];

    for (const rule of rules) {
        await prisma.pricingRule.upsert({
            where: { rule_name: rule.rule_name },
            update: rule,
            create: {
                ...rule,
                is_active: true
            }
        });
    }

    console.log('✅ Pricing rules seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
