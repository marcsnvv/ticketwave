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

const websites = [
    { "value": "viagogo.com", "label": "Viagogo.com" },
    { "value": "ticketmaster.be", "label": "Ticketmaster.be" },
    { "value": "ticketmaster.dk", "label": "Ticketmaster.dk" },
    { "value": "ticketmaster.de", "label": "Ticketmaster.de" },
    { "value": "ticketmaster.nl", "label": "Ticketmaster.nl" },
    { "value": "ticketmaster.fi", "label": "Ticketmaster.fi" },
    { "value": "ticketmaster.fr", "label": "Ticketmaster.fr" },
    { "value": "ticketmaster.no", "label": "Ticketmaster.no" },
    { "value": "ticketmaster.se", "label": "Ticketmaster.se" },
    { "value": "ticketmaster.at", "label": "Ticketmaster.at" },
    { "value": "ticketmaster.ae", "label": "Ticketmaster.ae" },
    { "value": "ticketmaster.pl", "label": "Ticketmaster.pl" },
    { "value": "ticketmaster.es", "label": "Ticketmaster.es" },
    { "value": "ticketmaster.ch", "label": "Ticketmaster.ch" },
    // { "value": "ticketmaster.it", "label": "Ticketmaster.it" },
    { "value": "ticketmaster.cz", "label": "Ticketmaster.cz" },
    { "value": "ticketmaster.co.za", "label": "Ticketmaster.co.za" },
    { "value": "ticketmaster.com", "label": "Ticketmaster.com" },
    { "value": "axs.com", "label": "Axs.com" },
    { "value": "queue.ticketmaster.com", "label": "TM Queue" },
    { "value": "ticketportal.cz", "label": "Ticketportal.cz" },
]

export default function MonitorsTable() {
    const router = useRouter()

    const [monitors, setMonitors] = useState([])
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedMonitor, setSelectedMonitor] = useState(null)
    const [selectedWebsite, setSelectedWebsite] = useState("")
    const [webhook, setWebhook] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Función para obtener el número de productos monitoreados
    const fetchTotalProducts = async (monitorId) => {
        const { data, error } = await supabase
            .from('products')
            .select('id')
            .eq('monitor_id', monitorId)

        if (error) {
            console.error('Error fetching products:', error)
            return 0
        }

        return data.length
    }

    // Cargar los monitores desde Supabase y el número de productos monitoreados
    useEffect(() => {
        async function fetchMonitors() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/login")
            }
            const { data, error } = await supabase
                .from('monitors')
                .select('*')

            if (error) {
                console.error('Error fetching monitors:', error)
                return
            }

            // Obtener el número de productos monitoreados para cada monitor
            const monitorsWithProducts = await Promise.all(
                data.map(async (monitor) => {
                    const totalProducts = await fetchTotalProducts(monitor.id)
                    return { ...monitor, totalProducts }
                })
            )

            setMonitors(monitorsWithProducts)
        }

        fetchMonitors()
    }, [])

    // Función para agregar un nuevo monitor
    const handleAddMonitor = async () => {
        setLoading(true)
        try {
            // Verificar si ya existe un monitor con el mismo nombre
            const { data: existingMonitors, error: fetchError } = await supabase
                .from('monitors')
                .select('*')
                .eq('name', selectedWebsite)

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
                .insert([{ name: selectedWebsite }])

            const monitorId = data[0].id; // Obtener el ID del monitor recién creado
            const { error: webhookError } = await supabase
                .from('webhooks')
                .insert([{ url: webhook, monitor_id: monitorId }])

            if (webhookError) {
                console.error('Error adding webhook:', webhookError)
            }

            if (error) {
                console.error('Error adding monitor:', error)
            } else {
                // Agregar el nuevo monitor con 0 productos monitoreados inicialmente
                setMonitors((prev) => [...prev, { ...data[0], totalProducts: 0 }])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Función para eliminar un monitor
    const handleDeleteMonitor = async (monitorId) => {
        try {
            await supabase
                .from('monitors')
                .delete()
                .eq('id', monitorId)

            await supabase
                .from('webhooks')
                .delete()
                .eq('monitor_id', monitorId)

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

            const { error: webhookError } = await supabase
                .from('webhooks')
                .update({ url: webhook })
                .eq('monitor_id', selectedMonitor.id)

            if (webhookError) {
                console.error('Error updating webhook:', webhookError)
            }

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

    const filteredMonitors = monitors.filter(monitor =>
        monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className='flex items-center justify-center mx-48 p-5'>
            <div className="w-full">
                <div className="flex justify-between mb-4">
                    <MagnifyingGlassIcon className="absolute mt-2 ml-2 text-white h-5 w-5" />
                    <Input
                        type="search"
                        placeholder="Search websites..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="lg:w-96 w-52 pl-9" // Added left padding to make room for icon
                    />
                    <Button onClick={() => setEditDialogOpen(true)}>Add Website</Button>
                </div>

                {/* Add search input */}

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Website</TableHead>
                                <TableHead>Monitoring</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMonitors.length ? (
                                filteredMonitors.map((monitor) => (
                                    <TableRow key={monitor.id}>
                                        <TableCell>
                                            {/* Mostrar el nombre del monitor con un enlace a la página de monitoreo */}
                                            <a
                                                href={`/dashboard/monitor/${monitor.id}`}
                                                className="flex items-center space-x-2 uppercase"
                                            >
                                                <TargetIcon className="h-4 w-4 mr-2" />
                                                {monitor.name}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {/* Mostrar el número total de productos monitoreados */}
                                            <Badge variant={
                                                monitor.totalProducts > 0 ? "primary" : "destructive"
                                            }>{monitor.totalProducts} events</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
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
                                            </DropdownMenu>
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

                            <Input
                                type="text"
                                placeholder="Enter webhook URL"
                                value={webhook}
                                onChange={(e) => setWebhook(e.target.value)}
                            />
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
