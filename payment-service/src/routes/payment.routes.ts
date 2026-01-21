//C:\Users\HP\Documents\5(1ST SEMESTER)\ds\u\distributed-parcel-delivery-system\distributed-parcel-delivery-system\payment-service\src\routes\payment.routes.ts
import { Router } from "express";
import { initiatePayment, verifyPayment } from "../controllers/chappa.controller";
import { getPaymentByOrderId, processPayment } from "../controllers/payment.controller";
import { calculateDeliveryFee, getPricingRulesEndpoint, getOrderCalculation } from "../controllers/pricing.controller";

const router = Router();

// Payment routes
router.post("/initiate", initiatePayment);
router.post("/mock-success", processPayment); // Dev endpoint for localhost testing
router.get("/verify", verifyPayment);
router.get("/order/:orderId", getPaymentByOrderId);

// Pricing routes
router.post("/calculate-fee", calculateDeliveryFee);
router.get("/pricing-rules", getPricingRulesEndpoint);
router.get("/calculation/:orderId", getOrderCalculation);

export default router;

