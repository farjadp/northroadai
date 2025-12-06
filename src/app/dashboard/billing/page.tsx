// ============================================================================
// 📁 Hardware Source: src/app/dashboard/billing/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Displays list of transactions from 'transactions' collection for the current user.
// ============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Client-side DB
import { CreditCard, Calendar, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

type Transaction = {
    id: string;
    amount: number;
    currency: string;
    itemId: string;
    status: string;
    timestamp: any;
    stripeSessionId?: string;
};

export default function BillingPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBilling() {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, "transactions"),
                    where("userId", "==", user.uid),
                    orderBy("timestamp", "desc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(data);
            } catch (error) {
                console.error("Billing fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchBilling();
    }, [user]);

    return (
        <div className="p-8 max-w-5xl mx-auto text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <CreditCard className="text-emerald-400" /> Billing & Transactions
            </h1>
            <p className="text-slate-400 mb-8">View your payment history and active clearances.</p>

            {/* Stats Cards (Mock for now, could be real) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <h3 className="text-xs text-slate-500 uppercase">Total Spent</h3>
                    <p className="text-2xl font-bold text-white">
                        ${transactions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="font-bold">Transaction History</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading records...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Clock size={48} className="mb-4 opacity-20" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs text-slate-400 uppercase">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ref ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {transactions.map((tx, i) => (
                                <motion.tr
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="p-4 text-sm text-slate-300 font-mono">
                                        {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : "Pending..."}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-white capitalize">{tx.itemId.replace(/_/g, " ")} Access</span>
                                    </td>
                                    <td className="p-4 font-mono text-emerald-400">
                                        ${tx.amount.toFixed(2)} {tx.currency.toUpperCase()}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                            <CheckCircle size={10} /> {tx.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-600 font-mono truncate max-w-[100px]" title={tx.stripeSessionId}>
                                        {tx.id.substring(0, 12)}...
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
