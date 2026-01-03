'use server';

import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import UserCollection from "@/models/UserCollection";
import Insurance from "@/models/Insurance";
import Instrument from "@/models/Instrument";
import { revalidatePath } from "next/cache";

// --- HELPERS ---

function calculateDepreciationSchedule(cost: number, purchaseDate: Date, usefulLifeYears: number = 5) {
    const schedule = [];
    const yearlyDepreciation = cost / usefulLifeYears;
    const currentYear = new Date().getFullYear();
    const purchaseYear = new Date(purchaseDate).getFullYear();

    for (let i = 0; i <= usefulLifeYears; i++) {
        const year = purchaseYear + i;
        const bookValue = Math.max(0, cost - (yearlyDepreciation * i));
        schedule.push({
            year,
            bookValue,
            depreciationAmount: i === 0 ? 0 : yearlyDepreciation
        });
    }
    return schedule;
}

// --- ACTIONS ---

export async function getFinanceDashboardData() {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();
        const userId = (session.user as any).id;
        const mongoose = (await import('mongoose')).default;

        // 1. Aggregation for Collection Cost
        const costResult = await UserCollection.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), deletedAt: null } },
            { $group: { _id: null, totalCost: { $sum: "$acquisition.price" }, count: { $sum: 1 } } }
        ]);

        // 2. Aggregation for Insurance Coverage
        const insuranceResult = await Insurance.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId), endDate: { $gt: new Date() } } },
            { $group: { _id: null, totalInsured: { $sum: "$coverageAmount" }, count: { $sum: 1 } } }
        ]);

        const totalCost = costResult[0]?.totalCost || 0;
        const itemCount = costResult[0]?.count || 0;
        const totalInsured = insuranceResult[0]?.totalInsured || 0;
        const policyCount = insuranceResult[0]?.count || 0;

        return {
            success: true,
            data: {
                totalCost,
                totalInsured,
                coverageRatio: totalCost > 0 ? (totalInsured / totalCost) * 100 : 0,
                policyCount,
                itemCount
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getInstrumentFinancials(collectionItemId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();

        // Get acquisition data
        const collectionItem = await UserCollection.findOne({
            _id: collectionItemId,
            userId: (session.user as any).id,
            deletedAt: null
        }).lean();

        if (!collectionItem) return { success: false, error: "Instrument not found in collection" };

        // Get Active Insurance
        const policies = await Insurance.find({
            userId: (session.user as any).id,
            collectionItemId: collectionItemId
        }).sort({ endDate: -1 }).lean();

        const activePolicy = policies.find(p => new Date(p.endDate) > new Date());

        // Calculation
        const cost = collectionItem.acquisition?.price || 0;
        const date = collectionItem.acquisition?.date ? new Date(collectionItem.acquisition.date) : new Date();
        const depreciation = calculateDepreciationSchedule(cost, date, 10); // Default 10 years

        return {
            success: true,
            data: {
                acquisition: collectionItem.acquisition,
                policies: JSON.parse(JSON.stringify(policies)),
                activePolicy: activePolicy ? JSON.parse(JSON.stringify(activePolicy)) : null,
                depreciation
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveInsurancePolicy(data: any) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();

        if (data._id) {
            await Insurance.findByIdAndUpdate(data._id, {
                ...data,
                userId: (session.user as any).id
            });
        } else {
            await Insurance.create({
                ...data,
                userId: (session.user as any).id
            });
        }

        revalidatePath(`/instruments/${data.instrumentId}`);
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteInsurancePolicy(policyId: string, instrumentId: string) {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    try {
        await dbConnect();
        await Insurance.findByIdAndDelete(policyId);
        revalidatePath(`/instruments/${instrumentId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
