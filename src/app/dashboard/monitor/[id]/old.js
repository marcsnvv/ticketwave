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
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import Loader from '@/components/ui/loader' // Asegúrate de tener un componente de loader

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
    const [loading, setLoading] = useState(false) // Estado para el spinner de carga
    const [monitorName, setMonitorName] = useState("") // Estado para el nombre del monitor

    const [newEventMaxPrice, setNewEventMaxPrice] = useState("") // Nuevo estado para el Max Price

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
                    setMonitorName(data[0].monitors.name)
                }
            }
            fetchProducts()
        }
    }, [id])

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
        setNewWebhookUrl(product.webhook_url) // Cargar la URL del webhook para edición
    }

    // Función para guardar los cambios
    const handleSave = async () => {
        setLoading(true) // Activar el spinner de carga
        if (editProduct) {
            const { error } = await supabase
                .from('products')
                .update({ name: newName, url: newUrl, max_price: newEventMaxPrice }) // Actualizar con webhook_url
                .eq('id', editProduct.id)

            const { error: webhookError } = await supabase
                .from('webhooks')
                .insert([{ webhook_url: newWebhookUrl, monitor_id: editProduct.monitor_id, product_id: editProduct.id }]); // Insertar el webhook_url relacionado con el producto y el monitor

            if (webhookError) {
                console.error('Error adding webhook:', webhookError);
            }

            if (error) {
                console.error('Error updating product:', error)
            } else {
                setProducts(products.map(product =>
                    product.id === editProduct.id ? { ...product, name: newName, url: newUrl, max_price: newEventMaxPrice, webhook_url: newWebhookUrl } : product
                ))
            }
        }
        setLoading(false) // Desactivar el spinner de carga
        setEditProduct(null) // Cerrar el dialogo
    }

    // Función para añadir un nuevo evento
    const handleAddEvent = async () => {

        const { data: productData, error: productError } = await supabase
            .from('products')
            .insert([{ name: newEventName, url: newEventUrl, monitor_id: id, max_price: newEventMaxPrice }])
            .select('id'); // Insertar el producto y obtener su id

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
            console.error('Error adding new event:', error)
        } else {
            // Añadir el nuevo producto a la lista
            setProducts([...products, { name: newEventName, url: newEventUrl, max_price: newEventMaxPrice, webhooks: [{ webhook_url: newEventWebhookUrl }], monitor_id: id }])
            setNewEventDialogOpen(false) // Cerrar el diálogo
            setNewEventName('') // Resetear el nombre
            setNewEventUrl('') // Resetear la URL
            setNewEventWebhookUrl('') // Resetear la URL del webhook
        }
    }

    return (
        <div className="w-full">

            {/* Sección para añadir nuevos eventos */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white mb-4">{monitorName}</h2>
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
                            <div className="grid gap-4">
                                <Label htmlFor="event-name">
                                    Name
                                </Label>
                                <Input
                                    id="event-name"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label htmlFor="event-url">
                                    URL
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
                                    Max price (for price errors)
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
                            <div className="grid gap-4">
                                <Label htmlFor="event-webhook-url">
                                    Webhook URL
                                </Label>
                                <Input
                                    id="event-webhook-url"
                                    value={newEventWebhookUrl}
                                    onChange={(e) => setNewEventWebhookUrl(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
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
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length ? (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>
                                        <a
                                            href={product.url}
                                            className="text-blue-500 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {product.url?.slice(0, 40)}...
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={product.webhooks[0].webhook_url} // Mostrar la URL del webhook
                                            className="text-blue-500 underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {product.webhooks?.[0]?.webhook_url?.slice(0, 40)}...
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {product.max_price ? product.max_price + " $" : "-- $"}
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
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">No products found</TableCell>
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
                            <div className="grid gap-4">
                                <Label htmlFor="product-name">
                                    Name
                                </Label>
                                <Input
                                    id="product-name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label htmlFor="product-url">
                                    URL
                                </Label>
                                <Input
                                    id="product-url"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid gap-4">
                                <Label htmlFor="event-webhook-url">
                                    Max price (for price errors)
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
                            <div className="grid gap-4">
                                <Label htmlFor="product-webhook-url">
                                    Webhook URL
                                </Label>
                                <Input
                                    id="product-webhook-url"
                                    value={newWebhookUrl}
                                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {loading && <Loader />} {/* Muestra un spinner de carga si loading es true */}
        </div>
    )
}