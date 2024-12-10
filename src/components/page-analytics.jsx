"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function PageAnalytics({ data, title, description }) {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
    const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
    const profit = totalRevenue - totalExpenses

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                                name="Revenue"
                            />
                            <Bar
                                dataKey="expenses"
                                fill="hsl(var(--destructive))"
                                radius={[4, 4, 0, 0]}
                                name="Expenses"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    <TrendingUp className="h-4 w-4" />
                    Total profit: ${profit}
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing financial data for the last {data.length} months
                </div>
            </CardFooter>
        </Card>
    )
}