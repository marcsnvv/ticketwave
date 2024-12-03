"use client"

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { supabase } from '../../../../../supabase'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DotsHorizontalIcon, ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon, CheckIcon, LapTimerIcon, Link1Icon, DiscordLogoIcon, MixerHorizontalIcon, TrashIcon } from '@radix-ui/react-icons'
import Loader from '@/components/ui/loader' // Asegúrate de tener un componente de loader
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'
import AddEvent from './add-event'
import EditEventDialog from './edit-event'


export default function ProductsTable({ params }) {
    const router = useRouter()

    const id = params.id
    const [products, setProducts] = useState([])
    const [editProduct, setEditProduct] = useState(null)
    const [newName, setNewName] = useState("")
    const [newUrl, setNewUrl] = useState("")
    const [newWebhookUrl, setNewWebhookUrl] = useState("") // Nuevo estado para el webhook
    const [newEvent, setNewEvent] = useState(false)
    const [newEventName, setNewEventName] = useState("")
    const [newEventUrl, setNewEventUrl] = useState("")
    const [newEventWebhookUrl, setNewEventWebhookUrl] = useState("") // Nuevo estado para el webhook del evento
    const [resell, setResell] = useState(false)
    const [rolePing, setNewRolePing] = useState("")
    const [loading, setLoading] = useState(false) // Estado para el spinner de carga
    const [monitorName, setMonitorName] = useState("") // Estado para el nombre del monitor
    const [newEventMaxPrice, setNewEventMaxPrice] = useState("") // Nuevo estado para el Max Price
    const [expanded, setExpanded] = useState(null) // Estado para controlar qué fila está expandida
    const [error, setError] = useState(""); // Estado para manejar errores
    const [autoDeleteDate, setAutoDeleteDate] = useState("")
    const [newEventAutoDeleteDate, setNewEventAutoDeleteDate] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [roles, setRoles] = useState([])
    const [channels, setChannels] = useState([])
    const [openWebhook, setOpenWebhook] = useState(false)
    const [openRole, setOpenRole] = useState(false)

    // Cargar productos asociados a un monitor específico
    useEffect(() => {
        if (id) {
            async function fetchProducts() {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router("/login")
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*, webhooks(webhook_url), monitors(name)')
                    .eq('monitor_id', id)

                if (error) {
                    console.error('Error fetching products:', error)
                } else {
                    setProducts(data)

                    if (!data.length > 0) {
                        const { data: monitorNameData } = await supabase
                            .from('monitors')
                            .select('name')
                            .eq('id', id)

                        setMonitorName(monitorNameData[0].name)

                    } else {
                        setMonitorName(data[0]?.monitors?.name)
                    }
                }
            }
            fetchProducts()
        }
    }, [id])

    // Add this to your existing useEffect or create a new one
    useEffect(() => {
        const fetchData = async () => {
            const { data: rolesData } = await supabase.from('roles').select('*')
            const { data: channelsData } = await supabase.from('channels').select('*')
            setRoles(rolesData || [])
            setChannels(channelsData || [])
        }
        fetchData()
    }, [])

    // Agrupar productos por nombre
    const groupedProducts = products.reduce((acc, product) => {
        const existingProduct = acc.find(p => p.name === product.name);
        if (existingProduct) {
            // Si ya existe, añade las URLs adicionales y otros detalles
            existingProduct.items.push(product);
        } else {
            // Si no existe, lo añadimos con la estructura adecuada
            acc.push({
                name: product.name,
                items: [product],
            });
        }
        return acc;
    }, []);

    // Función para expandir/colapsar filas
    const handleToggleExpand = (productName) => {
        setExpanded(expanded === productName ? null : productName)
    }

    // Función para eliminar un producto
    const handleDelete = async (productId) => {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)

        if (error) {
            console.error('Error deleting product:', error)
        } else {
            setProducts(products.filter(product => product.id !== productId))
        }
    }

    // Función para abrir el dialogo de edición
    const handleEdit = (product) => {
        setEditProduct(product)
        setNewName(product.name)
        setNewUrl(product.url)
        setNewWebhookUrl(product.webhook_url)
        setNewRolePing(product.role_ping)
        setResell(product.resell)
        setAutoDeleteDate(product.autodelete_event || '') // Add this line
    }

    // Función para guardar los cambios
    const handleSave = async () => {
        setLoading(true)
        setError("")

        // Validación de URL
        if (newUrl && !newUrl.includes(monitorName)) {
            setError("The URL must start with 'https://' and contain the monitor name.");
            setLoading(false)
            return
        }

        // Validación de Webhook URL
        if (newWebhookUrl && !newWebhookUrl.startsWith("https://discord.com/api")) {
            setError("The Webhook URL must start with 'https://discord.com/api'.");
            setLoading(false);
            return;
        }

        // Validación de Max Price
        if (newEventMaxPrice && isNaN(newEventMaxPrice)) {
            setError("Max Price must be a number.");
            setLoading(false);
            return;
        }

        // Validación de Auto Delete Date, no es una fecha válida
        if (autoDeleteDate && isNaN(new Date(autoDeleteDate).getTime())) {
            setError("Auto Delete Date must be a valid date.");
            setLoading(false);
            return;
        }

        const updates = {};
        if (newName) updates.name = newName;
        if (newUrl) updates.url = newUrl;
        if (newEventMaxPrice) updates.max_price = newEventMaxPrice;
        if (rolePing) updates.role_ping = rolePing;
        if (resell !== null) updates.resell = resell;
        if (autoDeleteDate) updates.autodelete_event = autoDeleteDate; // Add this line

        if (editProduct) {
            const { error } = await supabase
                .from('products')
                .update(updates) // Actualizar solo los campos que han cambiado
                .eq('id', editProduct.id)

            if (error) {
                console.error('Error updating product:', error)
            } else {
                setProducts(products.map(product =>
                    product.id === editProduct.id ? { ...product, ...updates } : product
                ))
            }
        }
        setLoading(false) // Desactivar el spinner de carga
        setEditProduct(null) // Cerrar el dialogo
    }

    // Función para añadir un nuevo evento
    const handleAddEvent = async () => {
        setError("")

        if (monitorName === "" || !monitorName) {
            // Haz una petición a la base de datos para obtener el nombre del monitor
            const { data: monitorData, error: monitorError } = await supabase
                .from('monitors')
                .select('name')
                .eq('id', id)

            if (monitorError) {
                console.error('Error fetching monitor name:', monitorError)
                return;
            }

            setMonitorName(monitorData[0].name)
        }

        // Validación de URL
        if (newUrl && !newUrl.includes(monitorName)) {
            setError("The URL must start with 'https://' and contain the monitor name.");
            setLoading(false)
            return
        }

        // Validación de Webhook URL
        if (!newEventWebhookUrl.startsWith("https://discord.com/api")) {
            setError("The Webhook URL must start with 'https://discord.com/api'.");
            return;
        }

        // Validación de Max Price
        if (newEventMaxPrice && isNaN(newEventMaxPrice)) {
            setError("Max Price must be a number.");
            return;
        }

        // Validación de Auto Delete Date, no es una fecha válida
        if (newEventAutoDeleteDate && isNaN(new Date(newEventAutoDeleteDate).getTime())) {
            setError("Auto Delete Date must be a valid date.");
            return;
        }


        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([{
                name: newEventName,
                url: newEventUrl,
                monitor_id: id,
                max_price: newEventMaxPrice,
                role_ping: rolePing,
                resell: resell,
                autodelete_event: autoDeleteDate
            }])
            .select('id')

        if (!productError && productData.length > 0) {
            const product_id = productData[0].id;
            const { error: webhookError } = await supabase
                .from('webhooks')
                .insert([{ webhook_url: newEventWebhookUrl, monitor_id: id, product_id }]);

            if (webhookError) {
                console.error('Error adding webhook:', webhookError);
            }
        }

        if (productError) {
            console.error('Error adding new event:', productError)
        } else {
            setProducts([...products, {
                name: newEventName,
                url: newEventUrl,
                max_price: newEventMaxPrice,
                role_ping: rolePing,
                resell: resell,
                webhooks: [{ webhook_url: newEventWebhookUrl }],
                monitor_id: id,
                autodelete_event: autoDeleteDate
            }])
            setNewEvent(false) // Cerrar el diálogo
            setNewEventName('') // Resetear el nombre
            setNewEventUrl('') // Resetear la URL
            setNewEventWebhookUrl('') // Resetear la URL del webhook
        }
    }

    const filteredProducts = groupedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className='flex items-center justify-center mx-48 p-5'>
            <div className="w-full">
                {/* Sección para añadir nuevos eventos */}
                <div className="flex justify-between mb-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                        <Input
                            type="search"
                            placeholder={`Search events on ${monitorName}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="lg:w-96 w-52 pl-9" // Added padding for the icon
                        />
                    </div>
                    <Button
                        onClick={() => setNewEvent(true)}
                        variant="outline"
                    >Add New Event</Button>

                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Webhook URL</TableHead>
                                <TableHead>Max Price</TableHead>
                                <TableHead>Auto Delete</TableHead>  {/* New column */}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length ? (
                                filteredProducts.map((group) => (
                                    <>
                                        <TableRow key={group.name} className="cursor-pointer" onClick={() => handleToggleExpand(group.name)}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {expanded === group.name ? (
                                                        <ChevronDownIcon className="mr-2" />
                                                    ) : (
                                                        <ChevronRightIcon className="mr-2" />
                                                    )}
                                                    {group.name}
                                                </div>
                                            </TableCell>

                                        </TableRow>
                                        {/* Filas desplegadas con los productos individuales */}
                                        {expanded === group.name && (
                                            group.items.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell></TableCell>

                                                    <TableCell>
                                                        <a
                                                            href={product.url}
                                                            className="text-blue-500 underline flex items-center gap-1"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Link1Icon className="w-4 h-4 mr-1" />
                                                            {product.url.slice(0, 25)}...
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.webhooks.map((webhook, index) => (
                                                            <div key={index}>
                                                                <a
                                                                    href={webhook.webhook_url}
                                                                    className="text-blue-500 underline flex items-center gap-1"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <DiscordLogoIcon className="w-4 h-4 mr-1" />
                                                                    {webhook.webhook_url.slice(0, 25)}...
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={product.max_price ? "primary" : "gray"}
                                                        >
                                                            {product.max_price ? product.max_price.toLocaleString() + " $" : "-- $"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className='flex items-center gap-2'>
                                                            <LapTimerIcon className='w-4 h-4' />

                                                            {product.autodelete_event ? (
                                                                <time className='text-sm text-gray-300' dateTime={new Date(product.autodelete_event).toLocaleString()}>{new Date(product.autodelete_event).toLocaleString()}</time>
                                                            ) : (
                                                                "Not set"
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost">
                                                                    <DotsHorizontalIcon className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleEdit(product)}>
                                                                    <MixerHorizontalIcon className="w-4 h-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                                                                    <TrashIcon className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="3" className="text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <EditEventDialog
                    editProduct={editProduct}
                    setEditProduct={setEditProduct}
                    newEventName={newEventName}
                    setNewEventName={setNewEventName}
                    newEventMaxPrice={newEventMaxPrice}
                    setNewEventMaxPrice={setNewEventMaxPrice}
                    newEventUrl={newEventUrl}
                    setNewEventUrl={setNewEventUrl}
                    newEventWebhookUrl={newEventWebhookUrl}
                    setNewEventWebhookUrl={setNewEventWebhookUrl}
                    openWebhook={openWebhook}
                    setOpenWebhook={setOpenWebhook}
                    openRole={openRole}
                    setOpenRole={setOpenRole}
                    channels={channels}
                    rolePing={rolePing}
                    setNewRolePing={setNewRolePing}
                    roles={roles}
                    autoDeleteDate={autoDeleteDate}
                    setAutoDeleteDate={setAutoDeleteDate}
                    resell={resell}
                    setResell={setResell}
                    error={error}
                    handleSave={handleSave}
                />

                <AddEvent
                    addEvent={newEvent}
                    setAddEvent={setNewEvent}
                    newEventName={newEventName}
                    setNewEventName={setNewEventName}
                    newEventMaxPrice={newEventMaxPrice}
                    setNewEventMaxPrice={setNewEventMaxPrice}
                    newEventUrl={newEventUrl}
                    setNewEventUrl={setNewEventUrl}
                    newEventWebhookUrl={newEventWebhookUrl}
                    setNewEventWebhookUrl={setNewEventWebhookUrl}
                    openWebhook={openWebhook}
                    setOpenWebhook={setOpenWebhook}
                    openRole={openRole}
                    setOpenRole={setOpenRole}
                    channels={channels}
                    rolePing={rolePing}
                    setNewRolePing={setNewRolePing}
                    roles={roles}
                    autoDeleteDate={autoDeleteDate}
                    setAutoDeleteDate={setAutoDeleteDate}
                    resell={resell}
                    setResell={setResell}
                    handleAddEvent={handleAddEvent}
                    error={error}
                    monitorType={monitorName}
                />


                {loading && <Loader />} {/* Muestra un spinner de carga si loading es true */}
            </div>

        </main>
    )
}
