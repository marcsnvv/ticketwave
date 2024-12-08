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
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

import { CircleAlert } from 'lucide-react'
import AddEvent from './add-event'
import EditEventDialog from './edit-event'
import { format } from "date-fns"; // Asegúrate de que este import esté presente
import { useToast } from "@/hooks/use-toast"


// Función auxiliar para truncar texto
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

export default function ProductsTable({ params }) {
    const router = useRouter()

    const label = params.id // Ahora params.id contiene el label
    const [products, setProducts] = useState([])
    const [editProduct, setEditProduct] = useState(null)
    const [newName, setNewName] = useState("")
    const [newUrl, setNewUrl] = useState("")
    const [newEvent, setNewEvent] = useState(false)
    const [newEventName, setNewEventName] = useState("")
    const [newEventUrl, setNewEventUrl] = useState("")
    const [newEventChannelId, setNewEventChannelId] = useState("") // Nuevo estado para el webhook del evento
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

    // Añadir el hook useToast
    const { toast } = useToast()

    // Extraer la función fetchData del useEffect
    const fetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router("/login")
        }

        // Primero obtener el monitor por label
        const { data: monitorData, error: monitorError } = await supabase
            .from('monitors')
            .select('id, name')
            .eq('name', label)

        if (monitorError) {
            console.error('Error fetching monitor:', monitorError)
            return
        }

        // Luego obtener los productos usando el id del monitor
        const { data, error } = await supabase
            .from('products')
            .select(`
                *,
                channels (
                    title,
                    webhook_url
                ),
                roles (
                    title,
                    role_id,
                    color
                )
            `)
            .eq('monitor_id', monitorData[0].id)
            .eq('company_id', localStorage.getItem('company_id'))

        if (error) {
            console.error('Error fetching products:', error)
        } else {
            setProducts(data)
            setMonitorName(monitorData[0].name)
        }

        // Buscar channels y roles
        const { data: rolesData } = await supabase
            .from('roles')
            .select('*')
            .eq('company_id', localStorage.getItem('company_id'))

        const { data: channelsData } = await supabase
            .from('channels')
            .select('*')
            .eq('company_id', localStorage.getItem('company_id'))

        setRoles(rolesData || [])
        setChannels(channelsData || [])
    }

    // Efecto inicial
    useEffect(() => {
        if (label) {
            fetchData()
        }
    }, [label])

    // Nuevo efecto para actualizar datos cuando products cambie
    useEffect(() => {
        if (products.length > 0) {
            const updateProductsData = async () => {
                const updatedProducts = await Promise.all(
                    products.map(async (product) => {
                        // Obtener datos actualizados del canal
                        if (product.channel) {
                            const { data: channelData } = await supabase
                                .from('channels')
                                .select('title, webhook_url')
                                .eq('id', product.channel)
                                .eq('company_id', localStorage.getItem('company_id'))
                                .single()

                            if (channelData) {
                                product.channels = channelData
                            }
                        }

                        // Obtener datos actualizados del rol
                        if (product.role) {
                            const { data: roleData } = await supabase
                                .from('roles')
                                .select('title,role_id,color')
                                .eq('id', product.role)
                                .eq('company_id', localStorage.getItem('company_id'))
                                .single()

                            if (roleData) {
                                product.roles = roleData
                            }
                        }

                        return product
                    })
                )
                setProducts(updatedProducts)
            }

            updateProductsData()
        }
    }, [products.length]) // Se ejecuta cuando cambia la longitud de products

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
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error deleting product"
            })
        } else {
            setProducts(products.filter(product => product.id !== productId))
            toast({
                title: "Success",
                description: "Product deleted successfully"
            })
        }
    }

    // Función para abrir el dialogo de edición
    const handleEdit = (product) => {
        setEditProduct(product)
        setNewName(product.name)
        setNewUrl(product.url)
        setNewEventMaxPrice(product.max_price)
        setNewEventChannelId(product.channel)
        setNewRolePing(product.role)
        setResell(product.resell)
        setAutoDeleteDate(product.autodelete_event || '') // Add this line
    }

    // Función para guardar los cambios
    const handleSave = async () => {
        setLoading(true)
        setError("")

        // Validación de URL
        if (newUrl && !newUrl.includes(monitorName)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "The URL must start with 'https://' and contain the monitor name."
            })
            setLoading(false)
            return
        }

        // Validación de Max Price
        if (newEventMaxPrice && isNaN(newEventMaxPrice)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Max Price must be a number."
            })
            setLoading(false)
            return;
        }

        // Validación de Auto Delete Date, no es una fecha válida
        if (autoDeleteDate && isNaN(new Date(autoDeleteDate).getTime())) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Auto Delete Date must be a valid date."
            })
            setLoading(false)
            return;
        }

        const updates = {};
        if (newName) updates.name = newName;
        if (newUrl) updates.url = newUrl;
        if (newEventMaxPrice) updates.max_price = newEventMaxPrice;
        if (newEventChannelId) updates.channel = newEventChannelId;
        if (rolePing) updates.role = rolePing;
        if (resell !== null) updates.resell = resell;
        if (autoDeleteDate) updates.autodelete_event = autoDeleteDate; // Add this line

        if (editProduct) {
            const { error } = await supabase
                .from('products')
                .update(updates) // Actualizar solo los campos que han cambiado
                .eq('id', editProduct.id)

            if (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error updating product"
                })
            } else {
                toast({
                    title: "Success",
                    description: "Product updated successfully"
                })
                // Obtener los datos actualizados del canal y rol
                let updatedProduct = { ...editProduct, ...updates }

                if (updates.channel) {
                    const { data: channelData } = await supabase
                        .from('channels')
                        .select('title, webhook_url')
                        .eq('id', updates.channel)
                        .eq('company_id', localStorage.getItem('company_id'))
                        .single()

                    if (channelData) {
                        updatedProduct.channels = channelData
                    }
                }

                if (updates.role) {
                    const { data: roleData } = await supabase
                        .from('roles')
                        .select('title, role_id, color')
                        .eq('id', updates.role)
                        .eq('company_id', localStorage.getItem('company_id'))
                        .single()

                    if (roleData) {
                        updatedProduct.roles = roleData
                    }
                }

                // Actualizar el estado con los nuevos datos
                setProducts(products.map(product =>
                    product.id === editProduct.id ? updatedProduct : product
                ))
            }
        }
        setLoading(false) // Desactivar el spinner de carga
        setEditProduct(null) // Cerrar el dialogo
    }

    // Función para añadir un nuevo evento
    const handleAddEvent = async () => {
        setError("")

        // Obtener el id del monitor usando el label
        const { data: monitorData, error: monitorError } = await supabase
            .from('monitors')
            .select('id')
            .eq('name', label)
            .eq('company_id', localStorage.getItem('company_id'))

        if (monitorError) {
            console.error('Error fetching monitor:', monitorError)
            return
        }

        if (monitorName === "" || !monitorName) {
            // Haz una petición a la base de datos para obtener el nombre del monitor
            const { data: monitorData, error: monitorError } = await supabase
                .from('monitors')
                .select('name')
                .eq('id', id)
                .eq('company_id', localStorage.getItem('company_id'))

            if (monitorError) {
                console.error('Error fetching monitor name:', monitorError)
                return;
            }

            setMonitorName(monitorData[0].name)
        }

        // Validación de URL
        if (newUrl && !newUrl.includes(monitorName)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "The URL must start with 'https://' and contain the monitor name."
            })
            setLoading(false)
            return
        }

        // Validación de Max Price
        if (newEventMaxPrice && isNaN(newEventMaxPrice)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Max Price must be a number."
            })
            return;
        }

        // Validación de Auto Delete Date, no es una fecha válida
        if (newEventAutoDeleteDate && isNaN(new Date(newEventAutoDeleteDate).getTime())) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Auto Delete Date must be a valid date."
            })
            return;
        }

        const newEvent = {
            name: newEventName,
            url: newEventUrl,
            monitor_id: monitorData[0]?.id, // Usar el id obtenido del monitor
            max_price: newEventMaxPrice,
            role: rolePing,
            resell: resell,
            autodelete_event: autoDeleteDate,
            channel: newEventChannelId,
            company_id: localStorage.getItem('company_id'),
        }


        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([newEvent])
            .select('id')

        if (!productError && productData.length > 0) {
            const product_id = productData[0].id;

            // 

        }

        if (productError) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error adding new event"
            })
        } else {
            toast({
                title: "Success",
                description: "Event added successfully"
            })
            setProducts([...products, {
                name: newEventName,
                url: newEventUrl,
                max_price: newEventMaxPrice,
                resell: resell,
                monitor_id: monitorData[0].id,
                autodelete_event: autoDeleteDate,
                role: rolePing,
                channel: newEventChannelId,
            }])
            setNewEvent(false) // Cerrar el diálogo
            setNewEventName('') // Resetear el nombre
            setNewEventUrl('') // Resetear la URL
            setNewEventChannelId('') // Resetear la URL del webhook
        }
    }

    const filteredProducts = groupedProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className='flex items-center justify-center lg:mx-48 p-5'>

            <div className="w-full">
                {
                    monitorName.includes("ticketportal") && (
                        <Alert className="mb-4">
                            <CircleAlert className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                The "idp" parameter is the event identifier, make sure your url has this parameter. A correct url will look something like this: https://www.ticketportal.cz/event/EWA-FARNA-10-let-haly-Polarka?idp=1394054
                            </AlertDescription>
                        </Alert>
                    )
                }


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
                                <TableHead>Role</TableHead>  {/* Nueva columna */}
                                <TableHead>Max Price</TableHead>
                                <TableHead>Auto Delete</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length ? (
                                filteredProducts?.map((group) => (
                                    <>
                                        <TableRow key={group.name} className="cursor-pointer" onClick={() => handleToggleExpand(group.name)}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {expanded === group.name ? (
                                                        <ChevronDownIcon className="mr-2" />
                                                    ) : (
                                                        <ChevronRightIcon className="mr-2" />
                                                    )}
                                                    <span title={group.name}>{truncateText(group.name, 30)}</span>
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
                                                            className="text-blue-500 hover:underline flex items-center gap-1"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Link1Icon className="w-4 h-4" />
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        {
                                                            product.channels ? (
                                                                <a
                                                                    href={product.channels?.webhook_url}
                                                                    className="text-blue-500 hover:underline flex items-center gap-1"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <DiscordLogoIcon className="w-4 h-4" />
                                                                    {product.channels?.title}
                                                                </a>
                                                            ) : (
                                                                "--"
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.roles ? (
                                                            <Badge
                                                                style={{
                                                                    backgroundColor: product.roles?.color || '#fff',
                                                                }}
                                                            >
                                                                {product.roles?.title || "--"}
                                                            </Badge>
                                                        ) : (
                                                            "--"
                                                        )}
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
                                                                <time
                                                                    className='text-sm text-gray-300'
                                                                    dateTime={product.autodelete_event}
                                                                >
                                                                    {format(new Date(product.autodelete_event), 'dd/MM/yyyy')}
                                                                </time>
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
                    newEventChannelId={newEventChannelId}
                    setNewEventChannelId={setNewEventChannelId}
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
                    newEventChannelId={newEventChannelId}
                    setNewEventChannelId={setNewEventChannelId}
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
