import { Request, Response } from "express";
import prisma from "../config/database";
import axios from "axios";

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";




export const initiatePayment = async (req: Request, res: Response) => {
  try {
    console.log("CHAPA KEY:", CHAPA_SECRET_KEY?.slice(0, 10));

    const { first_name, last_name, email, phone_number, amount } = req.body;
    if (!first_name || !last_name || !email || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tx_ref = `order-${Date.now()}`;

    // Initialize Chapa transaction without saving to DB
    const { data } = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: Number(amount),
        currency: "ETB",
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        callback_url: `${BASE_URL}/api/chapa/callback`,
        return_url: `${BASE_URL}/payment/success`,
        "customization[title]": "Order Payment",
        "customization[description]": `Payment for order ${tx_ref}`,
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (data.status === "success") {
      return res.json({ checkout_url: data.data.checkout_url });
    } else {
      return res.status(400).json({ message: data.message || "Chapa error" });
    }
  } catch (err: any) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { trx_ref } = req.query;
    const { data } = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${trx_ref}`,
      {
        headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` },
      }
    );

    if (data.status === "success") {
      await prisma.payment.update({
        where: { gateway_reference: String(trx_ref) },
        data: {
          status: data.data.status.toUpperCase(),
          gateway_transaction_id: data.data.id,
        },
      });
      return res.json({ message: "Payment verified", data });
    } else {
      return res.status(400).json({ message: "Payment not successful", data });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during verification." });
  }
};
