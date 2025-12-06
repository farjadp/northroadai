// ============================================================================
// 📁 Hardware Source: src/app/admin/transactions/page.tsx
// 🕒 Date: 2025-12-05
// 🧠 Version: v1.0
// ----------------------------------------------------------------------------
// ✅ Logic:
// Admin view of all transactions.
// ============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CreditCard, CheckCircle } from "lucide-react";

type Transaction = {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    itemId: string;
    status: string;
    timestamp: any;
    stripeSessionId?: string;
};

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                // Fetch last 50 transactions
                const q = query(
                    collection(db, "transactions"),
                    orderBy("timestamp", "desc"),
                    limit(50)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(data);
            } catch (error) {
                console.error("Admin tx fetch error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTransactions();
    }, []);

    return (
        <div className="text-slate-300">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Global Transactions
            </h1>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">User ID</th>
                            <th className="p-4">Item</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                        ) : transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-white/[0.02]">
                                <td className="p-4 text-sm font-mono">
                                    {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString() : "Pending"}
                                </td>
                                <td className="p-4 text-xs font-mono text-slate-500 truncate max-w-[100px]" title={tx.userId}>
                                    {tx.userId}
                                </td>
                                <td className="p-4 font-bold text-white capitalize">{tx.itemId}</td>
                                <td className="p-4 font-mono text-emerald-400">
                                    ${tx.amount.toFixed(2)} {tx.currency.toUpperCase()}
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                        <CheckCircle size={10} /> {tx.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
