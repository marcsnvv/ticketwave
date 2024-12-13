"use client"

import { Card, Title } from "@tremor/react"
import { PageAnalytics } from '@/components/page-analytics'
import { Users, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

export default function RevenueSection() {
    const chartdata = [
        { month: "January", revenue: 2890, expenses: 2400 },
        { month: "February", revenue: 2756, expenses: 2200 },
        { month: "March", revenue: 3322, expenses: 2400 },
        { month: "April", revenue: 3470, expenses: 2600 },
        { month: "May", revenue: 3475, expenses: 2500 },
        { month: "June", revenue: 3129, expenses: 2300 },
    ]

    return (
        <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-medium">Total Customers</h3>
                    </div>
                    <p className="text-2xl font-bold">150</p>
                </Card>
                {/* ... otros Cards similares ... */}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <PageAnalytics
                    data={chartdata}
                    title="Revenue vs Expenses"
                    description="Monthly revenue and expenses"
                />
            </div>
        </div>
    )
}
