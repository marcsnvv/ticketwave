"use client"

import { useEffect, useState } from "react"
import { Card, Title } from "@tremor/react"
import { PageAnalytics } from '@/components/page-analytics'
import { Users, DollarSign, ArrowUpCircle, ArrowDownCircle, Plus } from 'lucide-react'
import { supabase } from "../../../../../supabase"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function RevenueSection() {
    const [chartdata, setChartData] = useState(null)
    const [rawData, setRawData] = useState([]) // Nuevo estado para guardar todos los datos
    const [open, setOpen] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(null)
    const [graphData, setGraphData] = useState([])
    const { toast } = useToast()

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ]

    async function fetchChartData() {
        const { data, error } = await supabase
            .from('billing')
            .select('month,total_income,total_expenses,net_profit,created_at,updated_at')

        if (error) {
            console.error(error)
            return
        }

        setRawData(data) // Guardamos los datos completos
        processData(data, selectedMonth) // Nueva función para procesar datos
    }

    // Nueva función para procesar los datos
    const processData = (data, month) => {
        let filteredData = [...data]

        if (month) {
            const currentYear = new Date().getFullYear()
            filteredData = data.filter(item =>
                new Date(item.month).getMonth() + 1 === parseInt(month)
            )
        }

        if (!month && filteredData.length > 0) {
            // Calcular totales cuando no hay mes seleccionado
            const totals = filteredData.reduce((acc, curr) => ({
                total_income: acc.total_income + curr.total_income,
                total_expenses: acc.total_expenses + curr.total_expenses,
                net_profit: acc.net_profit + curr.net_profit
            }), {
                total_income: 0,
                total_expenses: 0,
                net_profit: 0
            })

            setChartData(totals)
        } else if (filteredData.length > 0) {
            setChartData(filteredData[0])
        } else {
            setChartData(null)
        }

        // Actualizar datos del gráfico
        const graphTransformedData = filteredData.map(item => ({
            month: new Date(item.month).toLocaleString('default', { month: 'long' }),
            revenue: item.total_income,
            expenses: item.total_expenses
        }))

        setGraphData(graphTransformedData)
    }

    useEffect(() => {
        fetchChartData()
    }, []) // Solo se ejecuta al montar el componente

    useEffect(() => {
        processData(rawData, selectedMonth)
    }, [selectedMonth, rawData]) // Se ejecuta cuando cambia el mes seleccionado o los datos

    const handleReset = () => {
        setSelectedMonth(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const month = formData.get('month')
        const revenue = parseFloat(formData.get('revenue'))
        const expenses = parseFloat(formData.get('expenses'))

        const { data, error } = await supabase
            .from('billing')
            .insert([{
                month,
                total_income: revenue,
                total_expenses: expenses,
            }])

        if (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not save the data"
            })
            return
        }

        toast({
            title: "Success",
            description: "Data saved successfully"
        })
        setOpen(false)
        // Recargar los datos
        fetchChartData()
    }

    return (
        <div className="grid gap-5">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Revenue</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue>
                                    {selectedMonth ? months.find((m) => m.value === selectedMonth).label : "Select Month"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((month) => (
                                    <SelectItem key={month.value} value={month.value}>
                                        {month.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Month
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Monthly Data</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="month">Month</Label>
                                    <Input
                                        id="month"
                                        name="month"
                                        type="date"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="revenue">Revenue</Label>
                                    <Input
                                        id="revenue"
                                        name="revenue"
                                        type="number"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expenses">Expenses</Label>
                                    <Input
                                        id="expenses"
                                        name="expenses"
                                        type="number"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Confirm
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-medium">Total Customers</h3>
                    </div>
                    <p className="text-2xl font-bold">150</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-medium">Total Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold">${chartdata?.total_income || 0}</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-medium">Total Expenses</h3>
                    </div>
                    <p className="text-2xl font-bold">${chartdata?.total_expenses || 0}</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium">Net Profit</h3>
                    </div>
                    <p className="text-2xl font-bold">${chartdata?.net_profit || 0}</p>
                </Card>
            </div>

            <div className="grid gap-4">
                <PageAnalytics
                    data={graphData}
                    title="Revenue vs Expenses"
                    description="Monthly revenue and expenses"
                />
            </div>
        </div>
    )
}
