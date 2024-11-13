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
import { DotsHorizontalIcon, ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon, CheckIcon } from '@radix-ui/react-icons'
import Loader from '@/components/ui/loader' // Asegúrate de tener un componente de loader
import Footer from '@/components/ui/footer' // Asegúrate de tener un componente de footer
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ProductsTable({ params }) {
    const router = useRouter()

    const id = params.id
    const [products, setProducts] = useState([])
    const [editProduct, setEditProduct] = useState(null)
    const [newName, setNewName] = useState("")
    const [newUrl, setNewUrl] = useState("")
    const [newWebhookUrl, setNewWebhookUrl] = useState("") // Nuevo estado para el webhook
    const [newEventDialogOpen, setNewEventDialogOpen] = useState(false)
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
                    console.log(data)
                    setProducts(data)
                    setMonitorName(data[0]?.monitors?.name)
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
        if (newUrl && !newUrl.startsWith(`https://${monitorName}`)) {
            setError("The URL must start with 'https://' and contain the monitor name.");
            setLoading(false);
            return;
        }

        // Validación de Webhook URL
        if (newWebhookUrl && !newWebhookUrl.startsWith("https://discord.com/api")) {
            setError("The Webhook URL must start with 'https://discord.com/api'.");
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

        // Validación de URL
        if (!newEventUrl.startsWith(`https://${monitorName}`) && !newEventUrl.startsWith(`https://www.${monitorName}`)) {
            setError(`The URL must start with 'https://${monitorName}' or 'https://www.${monitorName}'.`);
            return;
        }

        // Validación de Webhook URL
        if (!newEventWebhookUrl.startsWith("https://discord.com/api")) {
            setError("The Webhook URL must start with 'https://discord.com/api'.");
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
                autodelete_event: newEventAutoDeleteDate || null // Add this line
            }])
            .select('id')

        if (!productError && productData.length > 0) {
            const product_id = productData[0].id; // Obtener el id del producto recién creado
            const { error: webhookError } = await supabase
                .from('webhooks')
                .insert([{ webhook_url: newEventWebhookUrl, monitor_id: id, product_id }]); // Insertar el webhook_url relacionado con monitor_id

            if (webhookError) {
                console.error('Error adding webhook:', webhookError);
            }
        }

        if (productError) {
            console.error('Error adding new event:', productError)
        } else {
            // Añadir el nuevo producto a la lista
            setProducts([...products, { name: newEventName, url: newEventUrl, max_price: newEventMaxPrice, role_ping: rolePing, resell: resell, webhooks: [{ webhook_url: newEventWebhookUrl }], monitor_id: id }])
            setNewEventDialogOpen(false) // Cerrar el diálogo
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
                    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Add New Event</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Event</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new event below.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex justify-between gap-2">
                                    <div className="grid gap-4">
                                        <Label htmlFor="event-name">
                                            Name *
                                        </Label>
                                        <Input
                                            id="event-name"
                                            value={newEventName}
                                            onChange={(e) => setNewEventName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>

                                    <div className="grid gap-4">
                                        <Label htmlFor="event-webhook-url">
                                            Max price
                                        </Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                id="max-price"
                                                type="number"
                                                maxLength={4}
                                                value={newEventMaxPrice}
                                                onChange={(e) => setNewEventMaxPrice(e.target.value)}
                                                className="col-span-3"
                                            />
                                            <div className='flex items-center justify-center p-2 h-10 w-10 border border-gray rounded-lg'>
                                                $
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <Label htmlFor="event-url">
                                        URL *
                                    </Label>
                                    <Input
                                        id="event-url"
                                        value={newEventUrl}
                                        onChange={(e) => setNewEventUrl(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>

                                <div className="grid gap-4">
                                    <Label htmlFor="event-webhook-url">
                                        Webhook URL *
                                    </Label>
                                    <Popover open={openWebhook} onOpenChange={setOpenWebhook}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {newEventWebhookUrl || "Select webhook"}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 h-48">
                                            <Command>
                                                <CommandInput placeholder="Search webhook..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>No webhook found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {channels.sort((a, b) => a.title.localeCompare(b.title)).map((channel) => (
                                                            <CommandItem
                                                                key={channel.id}
                                                                value={channel.webhook_url}
                                                                onSelect={(currentValue) => {
                                                                    setNewEventWebhookUrl(currentValue === newEventWebhookUrl ? "" : currentValue)
                                                                    setOpenWebhook(false)
                                                                }}
                                                            >
                                                                {channel.title}
                                                                <CheckIcon
                                                                    className={`ml-auto h-4 w-4 ${newEventWebhookUrl === channel.webhook_url ? "opacity-100" : "opacity-0"}`}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex justify-between gap-2 items-center">
                                    <div className="grid gap-4 w-1/2">
                                        <Label htmlFor="product-webhook-url">
                                            Resell
                                        </Label>
                                        <Select onValueChange={(value) => setResell(value === "true")}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Resell" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">True</SelectItem>
                                                <SelectItem value="false">False</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-4 w-1/2">
                                        <Label htmlFor="role-ping">
                                            Role ping
                                        </Label>
                                        <Popover open={openRole} onOpenChange={setOpenRole}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {rolePing || "Select role"}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0 h-48">
                                                <Command>
                                                    <CommandInput placeholder="Search role..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No role found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {roles.sort((a, b) => a.title.localeCompare(b.title)).map((role) => (
                                                                <CommandItem
                                                                    key={role.id}
                                                                    value={role.role_id}
                                                                    onSelect={(currentValue) => {
                                                                        setNewRolePing(currentValue === rolePing ? "" : currentValue)
                                                                        setOpenRole(false)
                                                                    }}
                                                                >
                                                                    {role.title}
                                                                    <CheckIcon
                                                                        className={`ml-auto h-4 w-4 ${rolePing === role.role_id ? "opacity-100" : "opacity-0"}`}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <Label htmlFor="auto-delete-date">
                                        Date to autoremove
                                    </Label>
                                    <Input
                                        id="auto-delete-date"
                                        type="datetime-local"
                                        value={autoDeleteDate ? new Date(autoDeleteDate).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setAutoDeleteDate(new Date(e.target.value).toISOString())}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                {error && <span className="text-red-500 text-sm">{error}</span>}
                                <Button type="button" onClick={handleAddEvent}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                                            className="text-blue-500 underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {product.url.slice(0, 25)}...
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.webhooks.map((webhook, index) => (
                                                            <div key={index}>
                                                                <a
                                                                    href={webhook.webhook_url}
                                                                    className="text-blue-500 underline"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    {webhook.webhook_url.slice(0, 25)}...
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.max_price ? product.max_price + " $" : "-- $"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {product.autodelete_event ? (
                                                            <time className='text-sm text-gray-300' dateTime={new Date(product.autodelete_event).toLocaleString()}>{new Date(product.autodelete_event).toLocaleString()}</time>
                                                        ) : (
                                                            "Not set"
                                                        )}
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
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(product.id)}>
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

                {editProduct && (
                    <Dialog open={Boolean(editProduct)} onOpenChange={() => setEditProduct(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="flex justify-between gap-2">
                                    <div className="grid gap-4">
                                        <Label htmlFor="event-name">
                                            Name
                                        </Label>
                                        <Input
                                            id="event-name"
                                            value={newEventName}
                                            onChange={(e) => setNewEventName(e.target.value)}
                                            className="col-span-3"
                                            placeholder={editProduct.name}
                                        />
                                    </div>

                                    <div className="grid gap-4">
                                        <Label htmlFor="event-webhook-url">
                                            Max price
                                        </Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                id="max-price"
                                                type="number"
                                                maxLength={4}
                                                value={newEventMaxPrice}
                                                onChange={(e) => setNewEventMaxPrice(e.target.value)}
                                                className="col-span-3"
                                                placeholder={editProduct.max_price}
                                            />
                                            <div className='flex items-center justify-center p-2 h-10 w-10 border border-gray rounded-lg'>
                                                $
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <Label htmlFor="event-url">
                                        URL *
                                    </Label>
                                    <Input
                                        id="event-url"
                                        value={newEventUrl}
                                        onChange={(e) => setNewEventUrl(e.target.value)}
                                        className="col-span-3"
                                        placeholder={editProduct.url}
                                    />
                                </div>

                                <div className="grid gap-4">
                                    <Label htmlFor="event-webhook-url">
                                        Webhook URL *
                                    </Label>
                                    <Popover open={openWebhook} onOpenChange={setOpenWebhook}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                {newEventWebhookUrl || "Select webhook"}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0 h-48">
                                            <Command>
                                                <CommandInput placeholder="Search webhook..." className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>No webhook found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {channels.sort((a, b) => a.title.localeCompare(b.title)).map((channel) => (
                                                            <CommandItem
                                                                key={channel.id}
                                                                value={channel.webhook_url}
                                                                onSelect={(currentValue) => {
                                                                    setNewEventWebhookUrl(currentValue === newEventWebhookUrl ? "" : currentValue)
                                                                    setOpenWebhook(false)
                                                                }}
                                                            >
                                                                {channel.title}
                                                                <CheckIcon
                                                                    className={`ml-auto h-4 w-4 ${newEventWebhookUrl === channel.webhook_url ? "opacity-100" : "opacity-0"}`}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex justify-between gap-2 items-center">
                                    <div className="grid gap-4 w-1/2">
                                        <Label htmlFor="product-webhook-url">
                                            Resell
                                        </Label>
                                        <Select defaultValue={resell && resell === "true" ? "true" : "false"} onValueChange={(value) => setResell(value === "true")}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Resell" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">True</SelectItem>
                                                <SelectItem value="false">False</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-4">
                                        <Label htmlFor="product-webhook-url">
                                            Role Ping
                                        </Label>
                                        <Popover open={openRole} onOpenChange={setOpenRole}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {rolePing || "Select role"}
                                                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0 h-48">
                                                <Command>
                                                    <CommandInput placeholder="Search role..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No role found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {roles.sort((a, b) => a.title.localeCompare(b.title)).map((role) => (
                                                                <CommandItem
                                                                    key={role.id}
                                                                    value={role.role_id}
                                                                    onSelect={(currentValue) => {
                                                                        setNewRolePing(currentValue === rolePing ? "" : currentValue)
                                                                        setOpenRole(false)
                                                                    }}
                                                                >
                                                                    {role.title}
                                                                    <CheckIcon
                                                                        className={`ml-auto h-4 w-4 ${rolePing === role.role_id ? "opacity-100" : "opacity-0"}`}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    <Label htmlFor="auto-delete-date">
                                        Date to autoremove
                                    </Label>
                                    <Input
                                        id="auto-delete-date"
                                        type="datetime-local"
                                        value={autoDeleteDate ? new Date(autoDeleteDate).toISOString().slice(0, 16) : ''}
                                        onChange={(e) => setAutoDeleteDate(new Date(e.target.value).toISOString())}
                                        className="col-span-3"
                                        placeholder={editProduct.autodelete_event}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                {error && <span className="text-red-500 text-sm">{error}</span>}
                                <Button type="button" onClick={handleSave}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {loading && <Loader />} {/* Muestra un spinner de carga si loading es true */}
            </div>

        </main>
    )
}
