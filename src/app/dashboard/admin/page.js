"use client"

import { useState, useEffect } from 'react'
import { AreaChart, Card, Title } from "@tremor/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageAnalytics } from '@/components/page-analytics'
import {
    Users,
    DollarSign,
    ArrowUpCircle,
    ArrowDownCircle,
    Search,
    Mail,
    Trash2,
    MoreHorizontal
} from 'lucide-react'
import { supabase } from '../../../../supabase'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "marcsnvv@gmail.com", "busines1244@gmail.com"]

export default function AdminPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [customers, setCustomers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [revenueData, setRevenueData] = useState([])
    const [expensesData, setExpensesData] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        company_name: '',
        avatar_url: '' // Añadimos el nuevo campo
    })
    const [customerToDelete, setCustomerToDelete] = useState(null)

    // Datos de ejemplo para los gráficos
    const chartdata = [
        { month: "January", revenue: 2890, expenses: 2400 },
        { month: "February", revenue: 2756, expenses: 2200 },
        { month: "March", revenue: 3322, expenses: 2400 },
        { month: "April", revenue: 3470, expenses: 2600 },
        { month: "May", revenue: 3475, expenses: 2500 },
        { month: "June", revenue: 3129, expenses: 2300 },
    ]

    useEffect(() => {
        async function fetchData() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
                return
            }

            if (!admins_emails.includes(session.user.email)) {
                router.push("/login")
                return
            }

            // Obtener clientes
            const { data: customersData, error } = await supabase
                .from('users')
                .select('*,companies(name)')

            if (error) {
                console.error('Error fetching customers:', error)
                return
            }

            console.log(customersData)

            setCustomers(customersData)
            setRevenueData(chartdata)
            setExpensesData(chartdata)
        }

        fetchData()
    }, [])

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCreateCustomer = async () => {
        try {
            // Primero crear la compañía
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .insert([{ name: newCustomer.company_name }])
                .select()

            console.log(companyData)

            if (companyError) throw companyError

            // Luego crear el usuario con el ID de la compañía
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([{
                    name: newCustomer.name,
                    email: newCustomer.email,
                    company_id: companyData[0].company_id,
                    avatar_url: newCustomer.avatar_url // Añadimos el avatar_url
                }])
                .select()

            if (userError) throw userError

            // Actualizar la lista de clientes
            setCustomers([...customers, { ...userData[0], companies: { name: newCustomer.company_name } }])
            setIsOpen(false)
            setNewCustomer({ name: '', email: '', company_name: '', avatar_url: '' })

            toast({
                title: "Customer created",
                description: "The customer has been created successfully",
                variant: "success"
            })
        } catch (error) {
            console.error('Error creating customer:', error)
            toast({
                title: "Error",
                description: "There was an error creating the customer: " + error.message,
                variant: "destructive"
            })
        }
    }

    const handleDeleteCustomer = async (customer) => {
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', customer.id)

            if (error) throw error

            setCustomers(customers.filter(c => c.id !== customer.id))
            setCustomerToDelete(null)

            toast({
                title: "Customer deleted",
                description: "The customer has been deleted successfully",
                variant: "success"
            })
        } catch (error) {
            console.error('Error deleting customer:', error)
            toast({
                title: "Error",
                description: "There was an error deleting the customer: " + error.message,
                variant: "destructive"
            })
        }
    }

    const handleSendEmail = (email) => {
        window.location.href = `mailto:${email}`
    }

    return (
        <main className='grid gap-5 lg:mx-48 p-5'>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-medium">Total Customers</h3>
                    </div>
                    <p className="text-2xl font-bold">{customers.length}</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <h3 className="text-sm font-medium">Total Revenue</h3>
                    </div>
                    <p className="text-2xl font-bold">$12,345</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-medium">Monthly Growth</h3>
                    </div>
                    <p className="text-2xl font-bold">+15%</p>
                </Card>
                <Card className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-medium">Monthly Expenses</h3>
                    </div>
                    <p className="text-2xl font-bold">$3,400</p>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <PageAnalytics
                    data={chartdata}
                    title="Revenue vs Expenses"
                    description="Monthly revenue and expenses"
                />

                <Card className='p-4 border rounded-lg'>
                    <div className="flex items-center justify-between mb-4">
                        <Title>Customers</Title>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search customers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button>Add Customer</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Add New Customer</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col gap-4 py-4 items-start justify-start w-full">
                                        <div className='flex items-center justify-between gap-4 w-full'>
                                            <div className='flex flex-col item-start gap-2'>
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    placeholder='Jhon Doe'
                                                    id="name"
                                                    className="w-full"
                                                    value={newCustomer.name}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                                />
                                            </div>

                                            <div className='flex flex-col item-start gap-2'>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    placeholder='jhon@doe.com'
                                                    id="email"
                                                    className="w-full"
                                                    value={newCustomer.email}
                                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className='flex flex-col item-start gap-2 w-full'>
                                            <Label htmlFor="avatar">Avatar URL</Label>
                                            <Input
                                                placeholder="https://example.com/avatar.jpg"
                                                id="avatar"
                                                className="col-span-3"
                                                value={newCustomer.avatar_url}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, avatar_url: e.target.value })}
                                            />
                                        </div>

                                        <div className='flex flex-col item-start gap-2 w-full'>
                                            <Label htmlFor="company">Company Name</Label>
                                            <Input
                                                placeholder="TicketWave"
                                                id="company"
                                                className="col-span-3"
                                                value={newCustomer.company_name}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <Button className="w-auto" onClick={handleCreateCustomer}>Create Customer</Button>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Company</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer) => (
                                <TableRow key={customer.id}>
                                    <TableCell>{customer.name}</TableCell>                                    <TableCell>{customer.email}</TableCell>                                    <TableCell>
                                        <Badge color="blue">{customer.companies?.name}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleSendEmail(customer.email)}>
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setCustomerToDelete(customer)}
                                                    className="text-red-500 focus:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            <AlertDialog open={customerToDelete !== null} onOpenChange={() => setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            customer and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDeleteCustomer(customerToDelete)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}