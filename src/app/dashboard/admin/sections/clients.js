"use client"

import { useState, useEffect } from 'react'
import { Card } from "@tremor/react"
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
import {
    Users,
    Search,
    Mail,
    Trash2,
    MoreHorizontal
} from 'lucide-react'
import { supabase } from '../../../../../supabase'
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

const admins_emails = [process.env.ADMIN_EMAIL1, process.env.ADMIN_EMAIL2, "vuntagecom@gmail.com", "busines1244@gmail.com"]

export default function ClientsSection() {
    const router = useRouter()
    const { toast } = useToast()
    const [customers, setCustomers] = useState([])
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        company_name: '',
        avatar_url: '' // Añadimos el nuevo campo
    })
    const [customerToDelete, setCustomerToDelete] = useState(null)
    const [companies, setCompanies] = useState([])
    const [companiesAccess, setCompaniesAccess] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [isManageCompaniesOpen, setIsManageCompaniesOpen] = useState(false)

    // First, add this to your useEffect where you fetch the initial data
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

            setCustomers(customersData)
            setCompanies(customersData.map(company => ({
                company_id: company.company_id,
                name: company.companies.name
            })))

            const { data: companiesAccessData, error: cae } = await supabase
                .from("companies_access")
                .select("*")

            if (cae) {
                console.error('Error fetching companies access:', cae)
                return
            }

            setCompaniesAccess(companiesAccessData)

            // Obtener datos de los eventos monitoreados por cada usuario
            const { data: eventsData, error: eventsError } = await supabase
                .from('products')
                .select('name,url,company_id')

            if (eventsError) {
                console.error('Error fetching events:', eventsError)
                return
            }
            setProducts(eventsData)

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

    // Añade este nuevo estado
    const [selectedCompany, setSelectedCompany] = useState(null)

    // Modifica la función handleAddCompanyAccess
    const handleAddCompanyAccess = async (userId, companyId) => {
        try {
            if (!userId || !companyId) {
                throw new Error('User ID and Company ID are required')
            }

            // Create the access
            const { data: newAccess, error: insertError } = await supabase
                .from('companies_access')
                .insert([{
                    user_id: userId,
                    company_id: companyId
                }])
                .select()

            if (insertError) throw insertError

            // Update states
            setCompaniesAccess(prev => [...prev, ...(newAccess || [])])
            setSelectedCompany(null)
            setSelectedUser(prev => ({
                ...prev,
                companies_access: [
                    ...(prev.companies_access || []),
                    { company_id: companyId }
                ]
            }))

            toast({
                title: "Access granted",
                description: "Company access has been granted successfully",
                variant: "success"
            })
        } catch (error) {
            console.error('Error granting access:', error)
            toast({
                title: "Error",
                description: error.message || "There was an error granting access",
                variant: "destructive"
            })
        }
    }

    // Añade esta nueva función después de handleAddCompanyAccess
    const handleRemoveCompanyAccess = async (userId, companyId) => {
        try {
            const { error } = await supabase
                .from('companies_access')
                .delete()
                .match({ user_id: userId, company_id: companyId })

            if (error) throw error

            // Actualizar la lista de accesos
            const { data: newAccess, error: accessError } = await supabase
                .from('companies_access')
                .select('*')

            if (accessError) throw accessError

            setCompaniesAccess(newAccess)

            setCompanies(companies.filter(c => c.company_id !== companyId))
            setSelectedUser(
                {
                    ...selectedUser,
                    companies_access: selectedUser.companies_access.filter(ca => ca.company_id !== companyId)
                }
            )

            toast({
                title: "Access removed",
                description: "Company access has been removed successfully",
                variant: "success"
            })
        } catch (error) {
            console.error('Error removing access:', error)
            toast({
                title: "Error",
                description: "There was an error removing access: " + error.message,
                variant: "destructive"
            })
        }
    }

    return (
        <div className='w-full'>
            <div className="flex items-center justify-between mb-4 w-full">
                {/* <Title>Customers</Title> */}
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
            <Table className="p-2 rounded-[12px] bg-primary text-white">
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>
                                <Badge color="blue">{customer.companies?.name}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge>{
                                    // Filtrar los eventos, por el company id del usuario
                                    products.filter(product => product.company_id === customer.company_id).length

                                }</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedUser(customer)
                                            setIsManageCompaniesOpen(true)
                                        }}>
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Companies
                                        </DropdownMenuItem>
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
                                <Dialog open={isManageCompaniesOpen} onOpenChange={setIsManageCompaniesOpen}>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Manage Company Access</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h3 className="mb-2 font-medium">Current Access</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedUser?.companies_access?.map((access) => (
                                                        <Badge
                                                            key={access.company_id}
                                                            variant="secondary"
                                                            className="flex items-center gap-2"
                                                        >
                                                            {companies.find(c => c.company_id === access.company_id)?.name}
                                                            <button
                                                                onClick={() => handleRemoveCompanyAccess(selectedUser.id, access.company_id)}
                                                                className="ml-2 hover:text-red-500"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <h3 className="mb-2 font-medium">Add Access</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {companies
                                                    // Remove duplicates by filtering unique company_ids
                                                    .filter((company, index, self) =>
                                                        index === self.findIndex((c) => c.company_id === company.company_id)
                                                    )
                                                    .filter(company =>
                                                        !companiesAccess?.some(
                                                            access =>
                                                                access.company_id === company.company_id &&
                                                                access.user_id === selectedUser?.id
                                                        ) &&
                                                        company.company_id !== selectedUser?.company_id
                                                    )
                                                    .map(company => (
                                                        <Button
                                                            key={`company-${company.company_id}`}
                                                            variant={selectedCompany?.company_id === company.company_id ? "default" : "outline"}
                                                            className={`justify-start ${company.company_id === selectedUser?.company_id ? 'border-2 border-blue-500' : ''}`}
                                                            onClick={() => setSelectedCompany(company)}
                                                        >
                                                            {company.name}
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                            <Button
                                                className="mt-4"
                                                onClick={() => handleAddCompanyAccess(selectedUser.id, selectedCompany.company_id)}
                                                disabled={!selectedCompany}
                                            >
                                                Grant Access
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
        </div>
    )
}
