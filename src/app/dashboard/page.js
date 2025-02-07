"use client"

import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DotsHorizontalIcon, CaretSortIcon, CheckIcon, MagnifyingGlassIcon, TargetIcon, MixerHorizontalIcon, TrashIcon } from '@radix-ui/react-icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup
} from '@/components/ui/command'
import { supabase } from '../../../supabase'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import CreateCompany from '@/components/ui/create-company'

const websites = [
    { "value": "viagogo.com", "label": "Viagogo.com" },
    { "value": "ticketmaster.be", "label": "Ticketmaster.be" },
    { "value": "ticketmaster.dk", "label": "Ticketmaster.dk" },
    { "value": "ticketmaster.de", "label": "Ticketmaster.de" },
    { "value": "ticketmaster.nl", "label": "Ticketmaster.nl" },
    { "value": "ticketmaster.fi", "label": "Ticketmaster.fi" },
    { "value": "ticketmaster.fr", "label": "Ticketmaster.fr" },
    { "value": "ticketmaster.it", "label": "Ticketmaster.it" },
    { "value": "ticketmaster.no", "label": "Ticketmaster.no" },
    { "value": "ticketmaster.se", "label": "Ticketmaster.se" },
    { "value": "ticketmaster.at", "label": "Ticketmaster.at" },
    { "value": "ticketmaster.ae", "label": "Ticketmaster.ae" },
    { "value": "ticketmaster.pl", "label": "Ticketmaster.pl" },
    { "value": "ticketmaster.es", "label": "Ticketmaster.es" },
    { "value": "ticketmaster.ch", "label": "Ticketmaster.ch" },
    { "value": "ticketmaster.cz", "label": "Ticketmaster.cz" },
    { "value": "ticketmaster.co.za", "label": "Ticketmaster.co.za" },
    { "value": "ticketmaster.co.uk", "label": "Ticketmaster.co.uk" },
    { "value": "ticketmaster.com", "label": "Ticketmaster.com" },
    { "value": "axs.com", "label": "Axs.com" },
    { "value": "axs.nu", "label": "Axs.nu" },
    { "value": "axs.se", "label": "Axs.se" },
    { "value": "queue.ticketmaster.com", "label": "TM Queue" },
    { "value": "ticketportal.cz", "label": "Ticketportal.cz" },
    { "value": "eventim.de", "label": "Eventim.de" },
    { "value": "ticketone.it", "label": "Ticketone.it" },
    { "value": "ticketcorner.ch", "label": "Ticketcorner.ch" },
    { "value": "oeticket.com", "label": "Oeticket.com" },
    { "value": "eticketing.co.uk", "label": "Eticketing.co.uk" },
    { "value": "seetickets.com", "label": "Seetickets.com" },
]

export default function MonitorsTable() {
    const router = useRouter()

    const [monitors, setMonitors] = useState([])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedMonitor, setSelectedMonitor] = useState(null)
    const [selectedWebsite, setSelectedWebsite] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [sortColumn, setSortColumn] = useState(null)
    const [sortDirection, setSortDirection] = useState('asc')
    const [needsCompany, setNeedsCompany] = useState(true)
    const [user, setUser] = useState(null)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const fetchTotalProducts = async ({ monitorId, companyId }) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id')
                .eq('monitor_id', monitorId)
                .eq('company_id', companyId)

            if (error) {
                console.error('Error fetching products:', error.message);
                return 0;
            }

            return data.length; // Devuelve el número de productos
        } catch (err) {
            console.error('Unexpected error fetching products:', err);
            return 0;
        }
    }

    const fetchMonitors = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push("/login")
        }

        const company_id = localStorage.getItem('company_id')

        if (!company_id) {
            console.error('Company ID not found.')
            return
        }

        // Fetch all monitors for the company
        const { data: monitors, error: monitorsError } = await supabase
            .from('monitors')
            .select('*')
            .eq('company_id', company_id)

        if (monitorsError) {
            console.error('Error fetching monitors:', monitorsError)
            return
        }

        // Fetch all products for the company in a single query
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('monitor_id')
            .eq('company_id', company_id)

        if (productsError) {
            console.error('Error fetching products:', productsError)
            return
        }

        // Count products for each monitor
        const productCounts = products.reduce((acc, product) => {
            acc[product.monitor_id] = (acc[product.monitor_id] || 0) + 1
            return acc
        }, {})

        // Combine monitors with their product counts
        const monitorsWithProducts = monitors.map(monitor => ({
            ...monitor,
            totalProducts: productCounts[monitor.id] || 0
        }))

        setMonitors(monitorsWithProducts)
    }

    useEffect(() => {
        async function checkUserCompany() {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push("/login")
                    return
                }

                setUser(session.user)

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single()

                if (userError || !userData) {
                    setNeedsCompany(true)
                } else {
                    localStorage.setItem('company_id', userData.company_id)
                    setNeedsCompany(false)
                    await fetchMonitors()
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setIsInitialLoading(false)
            }
        }

        checkUserCompany()
    }, [])

    const handleCompanyCreated = (companyId) => {
        setNeedsCompany(false)
        // Refresh monitors
        fetchMonitors()
    }

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-white animate-[loading_1s_ease-in-out_infinite]"></div>
                </div>
            </div>
        )
    }

    if (needsCompany) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <CreateCompany
                    userData={user}
                    onCompanyCreated={handleCompanyCreated}
                />
            </div>
        )
    }

    // Función para agregar un nuevo monitor
    const handleAddMonitor = async () => {
        setLoading(true)
        try {
            const { data: existingMonitors, error: fetchError } = await supabase
                .from('monitors')
                .select('*')
                .eq('name', selectedWebsite)
                .eq('company_id', localStorage.getItem('company_id'))

            if (fetchError) {
                console.error('Error fetching monitors:', fetchError)
                setLoading(false)
                return
            }

            if (existingMonitors.length > 0) {
                console.error('Monitor with the same name already exists.')
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('monitors')
                .insert([{
                    name: selectedWebsite,
                    company_id: localStorage.getItem('company_id')
                }])

            if (error) {
                console.error('Error adding monitor:', error)
            } else {
                setMonitors((prev) => [...prev, { ...data?.[0], totalProducts: 0 }])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
            fetchMonitors()
            setAddDialogOpen(false)
        }
    }

    // Función para eliminar un monitor
    const handleDeleteMonitor = async (monitorId) => {
        try {
            await supabase
                .from('monitors')
                .delete()
                .eq('id', monitorId)
                .eq('company_id', localStorage.getItem('company_id'))

            setMonitors((prev) => prev.filter((monitor) => monitor.id !== monitorId))
        } catch (error) {
            console.error('Error deleting monitor:', error)
        }
    }

    // Abrir el dialog de edición
    const handleEditMonitor = (monitor) => {
        setSelectedMonitor(monitor)
        setSelectedWebsite(monitor.name)
        setEditDialogOpen(true)
    }

    // Función para editar un monitor
    const handleUpdateMonitor = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('monitors')
                .update({ name: selectedWebsite })
                .eq('id', selectedMonitor.id)

            if (error) {
                console.error('Error updating monitor:', error)
            } else {
                setMonitors((prev) =>
                    prev.map((monitor) =>
                        monitor.id === selectedMonitor.id
                            ? { ...monitor, name: selectedWebsite }
                            : monitor
                    )
                )
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
            setEditDialogOpen(false)
        }
    }

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const getSortedMonitors = () => {
        if (!sortColumn) return filteredMonitors

        return [...filteredMonitors].sort((a, b) => {
            if (sortColumn === 'website') {
                return sortDirection === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            }
            if (sortColumn === 'monitoring') {
                return sortDirection === 'asc'
                    ? a.totalProducts - b.totalProducts
                    : b.totalProducts - a.totalProducts
            }
            return 0
        })
    }

    const filteredMonitors = monitors.filter(monitor =>
        monitor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className='flex items-center justify-center w-full p-[24px] pt-[80px]'>

            <div className="w-full min-h-screen">

                {/* Add dialog */}
                <h2 className='text-5xl font-semibold text-white mb-4'>Website</h2>

                <div className="flex justify-between mb-4">
                    <MagnifyingGlassIcon className="absolute mt-2 ml-2 text-white/25 h-5 w-5" />
                    <Input
                        type="search"
                        placeholder="Search websites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="lg:w-64 w-52 pl-9 border-white/25 focus:border-white hover:border-white/50 text-white rounded-[6px]" // Added left padding to make room for icon
                    />
                    <Button onClick={() => setAddDialogOpen(true)}>Add Website</Button>
                </div>

                <hr className='mb-4 border-white/25' />

                <div className="bg-primary border-white/25 p-2 rounded-[12px] text-white">
                    <Table className="">
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort('website')}
                                >
                                    <div className='flex items-center gap-2'>
                                        <TargetIcon className="h-4 w-4" />
                                        Website {sortColumn === 'website' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort('monitoring')}
                                >
                                    Monitoring {sortColumn === 'monitoring' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="">
                            {getSortedMonitors().length ? (
                                getSortedMonitors().map((monitor) => (
                                    <TableRow key={monitor.id} className="">
                                        <TableCell>
                                            {/* Mostrar el nombre del monitor con un enlace a la página de monitoreo */}
                                            <a
                                                href={`/dashboard/monitor/${monitor.name}`}
                                                className="flex items-center gap-2"
                                            >
                                                <TargetIcon className="h-4 w-4" />
                                                {monitor.name}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {/* Mostrar el número total de productos monitoreados */}
                                            <Badge>{monitor.totalProducts} events</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                className='p-2 text-white hover:text-error'
                                                onClick={() => handleDeleteMonitor(monitor.id)}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                            {/* <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <DotsHorizontalIcon className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditMonitor(monitor)}>
                                                        <MixerHorizontalIcon className="h-4 w-4 mr-2" />
                                                        Edit Monitor
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteMonitor(monitor.id)}>
                                                        <TrashIcon className="h-4 w-4 mr-2" />
                                                        Delete Monitor
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu> */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="3" className="text-center">
                                        No monitors found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Dialog para agregar un nuevo monitor */}
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Monitor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {selectedWebsite
                                            ? websites.find((site) => site.value === selectedWebsite)?.label
                                            : "Select website..."}
                                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search website..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No website found.</CommandEmpty>
                                            <CommandGroup>
                                                {websites.map((site) => (
                                                    <CommandItem
                                                        key={site.value}
                                                        value={site.value}
                                                        onSelect={(currentValue) => {
                                                            setSelectedWebsite(currentValue === selectedWebsite ? "" : currentValue)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        {site.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                selectedWebsite === site.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddMonitor} disabled={loading}>
                                {loading ? "Adding..." : "Add Monitor"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialogo para editar un monitor */}
                <Dialog id="edit-monitor" open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Monitor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Similar al Popover de agregar monitor */}
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {selectedWebsite
                                            ? websites.find((site) => site.value === selectedWebsite)?.label
                                            : "Select website..."}
                                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Search website..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No website found.</CommandEmpty>
                                            <CommandGroup>
                                                {websites.map((site) => (
                                                    <CommandItem
                                                        key={site.value}
                                                        value={site.value}
                                                        onSelect={(currentValue) => {
                                                            setSelectedWebsite(currentValue === selectedWebsite ? "" : currentValue)
                                                            setOpen(false)
                                                        }}
                                                    >
                                                        {site.label}
                                                        <CheckIcon
                                                            className={cn(
                                                                "ml-auto h-4 w-4",
                                                                selectedWebsite === site.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdateMonitor} disabled={loading}>
                                {loading ? "Saving..." : "Update Monitor"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

        </main>
    )
}
