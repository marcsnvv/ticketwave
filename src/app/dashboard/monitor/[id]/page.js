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
import {
    DotsHorizontalIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    LapTimerIcon,
    Link1Icon,
    DiscordLogoIcon,
    MixerHorizontalIcon,
    TrashIcon,
    ChevronLeftIcon,
    DownloadIcon,
    UploadIcon,
    Pencil1Icon
} from '@radix-ui/react-icons'
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
import { Checkbox } from "@/components/ui/checkbox" // Añadir este import
import { AlertCircle } from 'lucide-react' // Añadir este import


// Función auxiliar para truncar texto
const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

function extractID(url) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathSegments = urlObj.pathname.split("/").filter(Boolean);
    if (hostname.includes("ticketcorner.ch")) {
        return pathSegments.pop().split("?")[0];
    } else if (hostname.includes("axs.com")) {
        return pathSegments[pathSegments.length - 2];
    } else if (hostname.includes("eventim.de")) {
        return pathSegments.pop().split("?")[0];
    }
    return pathSegments.pop().split("?")[0];
}

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
    const [monitorId, setMonitorId] = useState("") // Estado para el ID del monitor
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
    const [selectedProducts, setSelectedProducts] = useState([])
    const [showBulkEdit, setShowBulkEdit] = useState(false)

    // Añadir el hook useToast
    const { toast } = useToast()

    // Extraer la función fetchData del useEffect
    const fetchData = async () => {
        const companyId = localStorage.getItem('company_id')

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router("/login")
        }

        // Primero obtener el monitor por label
        const { data: monitorData, error: monitorError } = await supabase
            .from('monitors')
            .select('id,name')
            .eq('company_id', companyId)
            .eq('name', label)

        if (monitorError) {
            console.error('Error fetching monitor:', monitorError)
            return
        }

        // Luego obtener los productos usando el id del monitor
        let monitorId = monitorData[0].id
        setMonitorId(monitorId)

        if (!monitorId) {
            console.error('Monitor ID not found')
            toast({
                variant: "destructive",
                title: "Error",
                description: "Monitor ID not found, contact with support."
            })
            return
        }

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
            .eq('monitor_id', monitorId)
            .eq('company_id', companyId)


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
            .eq('company_id', companyId)

        const { data: channelsData } = await supabase
            .from('channels')
            .select('*')
            .eq('company_id', companyId)

        setRoles(rolesData || [])
        setChannels(channelsData || [])
    }

    useEffect(() => {
        if (label) {
            fetchData()
        }
    }, [])

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
    }, []) // Se ejecuta cuando cambia la longitud de products

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
        try {
            // Validar que existe el ID
            if (!productId) {
                throw new Error("Product ID is required")
            }

            // Validar que el ID tiene un formato válido
            if (typeof productId !== 'string' || productId.trim() === '') {
                throw new Error("Invalid product ID format")
            }

            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            if (error) {
                throw new Error(error.message)
            }

            // Si la eliminación fue exitosa, actualizar el estado
            setProducts(products.filter(product => product.id !== productId))

            toast({
                title: "Success",
                description: "Product deleted successfully"
            })
        } catch (error) {
            console.error('Error deleting product:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: `Error deleting product: ${error.message}`
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
        setLoading(true)

        try {
            // Validaciones básicas
            if (!newEventName?.trim()) {
                throw new Error("Event name is required")
            }

            if (!newEventUrl?.trim()) {
                throw new Error("URL is required")
            }

            if (!newEventChannelId) {
                throw new Error("Webhook channel is required")
            }

            const companyId = localStorage.getItem('company_id')
            if (!companyId) {
                throw new Error("Company ID not found")
            }

            if (!monitorId) {
                throw new Error("Monitor ID not found")
            }

            // Crear el objeto del nuevo evento solo con campos válidos
            const newEventData = {
                name: newEventName.trim(),
                url: newEventUrl.trim(),
                monitor_id: monitorId,
                channel: newEventChannelId,
                company_id: companyId,
                // Añadir campos opcionales solo si tienen valor
                ...(newEventMaxPrice && { max_price: Number(newEventMaxPrice) }),
                ...(rolePing && { role: rolePing }),
                ...(autoDeleteDate && { autodelete_event: autoDeleteDate }),
                resell: !!resell // Convertir a booleano
            }

            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert([newEventData])
                .select('*')

            if (productError) {
                throw new Error(productError.message)
            }

            // Éxito
            toast({
                title: "Success",
                description: "Event added successfully"
            })

            // Actualizar la lista de productos
            setProducts(prev => [...prev, productData[0]])

            // Resetear el formulario
            setNewEvent(false)
            setNewEventName('')
            setNewEventUrl('')
            setNewEventChannelId('')
            setNewEventMaxPrice('')
            setNewRolePing('')
            setAutoDeleteDate('')
            setResell(false)

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectAll = (checked) => {
        if (checked) {
            const allProductIds = products.map(product => product.id)
            setSelectedProducts(allProductIds)
        } else {
            setSelectedProducts([])
        }
    }

    const handleSelectProduct = (productId, checked) => {
        setSelectedProducts(prev => {
            if (checked) {
                return [...prev, productId]
            }
            return prev.filter(id => id !== productId)
        })
    }

    const handleBulkEdit = async (updates) => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('products')
                .update(updates)
                .in('id', selectedProducts)

            if (error) throw error

            // Actualizar la UI
            await fetchData()
            setSelectedProducts([])
            setShowBulkEdit(false)

            toast({
                title: "Success",
                description: "Products updated successfully"
            })
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            })
        }
        setLoading(false)
    }

    const filteredProducts = groupedProducts.filter(product => {
        const searchTermLower = searchTerm.toLowerCase();

        // Buscar en el nombre del evento
        const nameMatch = product.name.toLowerCase().includes(searchTermLower);

        // Buscar en las URLs de los items
        const urlMatch = product.items.some(item => {
            const urlId = extractID(item.url).toLowerCase();
            return urlId.includes(searchTermLower);
        });

        return nameMatch || urlMatch;
    });

    const exportToCSV = () => {
        // Preparar los datos para exportar
        const csvData = products.map(product => ({
            name: product.name,
            url: product.url,
            max_price: product.max_price || '',
            channel: product.channels?.title || '',
            role: product.roles?.title || '',
            autodelete_event: product.autodelete_event || '',
            resell: product.resell ? 'true' : 'false'
        }));

        // Crear el contenido CSV
        const headers = ['name', 'url', 'max_price', 'channel', 'role', 'autodelete_event', 'resell'];
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // Crear y descargar el archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${monitorName}_products.csv`;
        link.click();
    }

    const [importFile, setImportFile] = useState(null);
    const [importData, setImportData] = useState(null);
    const [importErrors, setImportErrors] = useState([]);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showImportConfirm, setShowImportConfirm] = useState(false);

    const validateImportData = (data) => {
        const errors = [];
        const warnings = [];
        let errorCount = 0;
        const MAX_ERRORS = 5;

        // Crear un mapa de eventos existentes para búsqueda rápida
        const existingEvents = new Map();
        products.forEach(product => {
            existingEvents.set(product.url, product.name);
        });

        // Detectar duplicados dentro del archivo CSV
        const csvEvents = new Map();

        // Función auxiliar para validar URL según el monitor
        const isValidUrl = (url) => {
            try {
                const urlObj = new URL(url);
                // Obtener el dominio base del monitor
                const monitorDomain = monitorName.toLowerCase();
                const urlDomain = urlObj.hostname.toLowerCase();

                // Validar según el tipo de monitor
                if (monitorDomain.includes('axs')) {
                    return urlDomain.includes('axs.com');
                } else if (monitorDomain.includes('eventim')) {
                    return urlDomain.includes('eventim');
                } else if (monitorDomain.includes('ticketcorner')) {
                    return urlDomain.includes('ticketcorner.ch');
                } else {
                    // Para otros monitores, validar que la URL contenga el nombre del monitor
                    return urlDomain.includes(monitorDomain);
                }
            } catch {
                return false;
            }
        };

        for (let index = 0; index < data.length; index++) {
            const row = data[index];

            if (errorCount >= MAX_ERRORS) {
                errors.push(`... and more errors (showing first ${MAX_ERRORS} only)`);
                break;
            }

            // Validaciones básicas
            if (!row.name || typeof row.name !== 'string') {
                errors.push(`Row ${index + 1}: Invalid name`);
                errorCount++;
            }

            if (!row.url || !isValidUrl(row.url)) {
                errors.push(`Row ${index + 1}: Invalid URL format`);
                errorCount++;
            }

            if (row.max_price && isNaN(Number(row.max_price))) {
                errors.push(`Row ${index + 1}: Invalid max price`);
                errorCount++;
            }

            if (row.channel && !channels.some(c => c.title === row.channel)) {
                errors.push(`Row ${index + 1}: Invalid channel`);
                errorCount++;
            }

            if (row.role && !roles.some(r => r.title === row.role)) {
                errors.push(`Row ${index + 1}: Invalid role`);
                errorCount++;
            }

            if (row.autodelete_event && isNaN(new Date(row.autodelete_event).getTime())) {
                errors.push(`Row ${index + 1}: Invalid date format`);
                errorCount++;
            }

            if (row.resell && !['true', 'false'].includes(row.resell.toLowerCase())) {
                errors.push(`Row ${index + 1}: Invalid resell value`);
                errorCount++;
            }

            // Revisar duplicados dentro del CSV
            if (csvEvents.has(row.url)) {
                warnings.push(`Row ${index + 1}: Duplicate event within import file - "${row.name}"`);
            } else {
                csvEvents.set(row.url, row.name);
            }

            // Revisar duplicados con eventos existentes
            if (existingEvents.has(row.url)) {
                warnings.push(`Row ${index + 1}: Event already exists - "${row.name}"`);
            }
        }

        return { errors, warnings };
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImportFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.split('\n');
                const headers = rows[0].split(',').map(h => h.trim());

                const data = rows.slice(1).map(row => {
                    const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    return headers.reduce((obj, header, index) => {
                        obj[header] = values[index];
                        return obj;
                    }, {});
                });

                setImportData(data);
                const { errors, warnings } = validateImportData(data);
                setImportErrors(errors);
                // Solo mostrar el diálogo de confirmación si no hay errores (los warnings no bloquean)
                setShowImportConfirm(errors.length === 0);

                // Guardar los warnings en el estado
                setImportWarnings(warnings);
            };
            reader.readAsText(file);
        }
    }

    // Añadir este nuevo estado
    const [importWarnings, setImportWarnings] = useState([]);

    const handleImport = async () => {
        try {
            setLoading(true);

            // Mapear los datos importados a los IDs correctos
            const mappedData = await Promise.all(importData.map(async (row) => {
                const channelId = channels.find(c => c.title === row.channel)?.id;
                const roleId = roles.find(r => r.title === row.role)?.id;

                return {
                    name: row.name,
                    url: row.url,
                    monitor_id: monitorId,
                    company_id: localStorage.getItem('company_id'),
                    max_price: row.max_price ? Number(row.max_price) : null,
                    channel: channelId,
                    role: roleId,
                    autodelete_event: row.autodelete_event || null,
                    resell: row.resell?.toLowerCase() === 'true'
                };
            }));

            const { data, error } = await supabase
                .from('products')
                .insert(mappedData)
                .select();

            if (error) throw error;

            toast({
                title: "Success",
                description: `Imported ${data.length} products successfully`
            });

            // Actualizar la lista de productos
            await fetchData();

            // Limpiar el estado de importación
            setImportFile(null);
            setImportData(null);
            setImportErrors([]);
            setShowImportDialog(false);
            setShowImportConfirm(false);

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='flex items-center justify-center w-full p-10 mt-[80px] h-full'>

            <div className="w-full min-h-screen h-full">
                {/* {
                    monitorName.includes("ticketportal") && (
                        <Alert className="mb-4">
                            <CircleAlert className="h-4 w-4" />
                            <AlertTitle>Heads up!</AlertTitle>
                            <AlertDescription>
                                The idp parameter is the event identifier, make sure your url has this parameter. A correct url will look something like this: https://www.ticketportal.cz/event/EWA-FARNA-10-let-haly-Polarka?idp=1394054
                            </AlertDescription>
                        </Alert>
                    )
                } */}
                <div className='flex items-center justify-start gap-4'>
                    <button
                        className='mb-2'
                        onClick={() => router.push("/dashboard")}
                    >
                        <svg width="14" height="30" viewBox="0 0 14 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 1L0.999998 15L13 29" stroke="#F0F0F0" stroke-linejoin="round" />
                        </svg>

                    </button>
                    <h2 className='text-5xl font-semibold text-white mb-4'>Website</h2>
                    <span className='text-white/25 text-2xl'>
                        {monitorName}
                    </span>
                </div>


                {/* Sección para añadir nuevos eventos */}
                <div className="flex justify-between mb-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute mt-2 ml-2 text-white/25 h-5 w-5" />
                        <Input
                            type="search"
                            placeholder={`Search events on ${monitorName}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="lg:w-72 w-52 pl-9 border-white/25 focus:border-white hover:border-white/50 text-white rounded-[6px]" // Added left padding to make room for icon
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="hidden lg:block"
                                        variant="outline"
                                    >
                                        More actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                                        <UploadIcon className="h-4 w-4 mr-2" />
                                        Import events
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToCSV}>
                                        <DownloadIcon className="h-4 w-4 mr-2" />
                                        Export events
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                onClick={() => setNewEvent(true)}
                            >
                                Add New Event
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Añadir botón de Bulk Edit cuando haya selección */}
                {selectedProducts.length > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                            {selectedProducts.length} selected
                        </span>
                        <Button
                            variant="outline"
                            onClick={() => setShowBulkEdit(true)}
                        >
                            Bulk Edit
                        </Button>
                    </div>
                )}

                <div className="bg-primary border-white/25 p-2 rounded-[12px] text-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-1/5">
                                    <Checkbox
                                        className="cursor-pointer border-gray-400"
                                        checked={selectedProducts.length === products.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                {/* <TableHead>Event</TableHead> */}
                                <TableHead>ID</TableHead>
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
                                            <TableCell>
                                                {" "}
                                            </TableCell>
                                            <TableCell>
                                                {" "}
                                            </TableCell>
                                            <TableCell>
                                                {" "}
                                            </TableCell>
                                            <TableCell>
                                                {" "}
                                            </TableCell>
                                            <TableCell>
                                                {" "}
                                            </TableCell>
                                            <TableCell>
                                                {" "}
                                            </TableCell>

                                        </TableRow>
                                        {/* Filas desplegadas con los productos individuales */}
                                        {expanded === group.name && (
                                            group.items.map((product) => (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <div className='flex items-center justify-start gap-2'>
                                                            <Checkbox
                                                                className="cursor-pointer border-gray-400"
                                                                checked={selectedProducts.includes(product.id)}
                                                                onCheckedChange={(checked) =>
                                                                    handleSelectProduct(product.id, checked)
                                                                }
                                                            />
                                                            {product.name}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell>
                                                        <a
                                                            href={product.url}
                                                            className="text-blue-500 hover:underline flex items-center gap-1"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {/* Show the event ID */}
                                                            {extractID(product.url)}
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
                                                        <button
                                                            className="text-white hover:text-secondaryAccent p-2"
                                                            onClick={() => handleEdit(product)}
                                                        >
                                                            <Pencil1Icon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            className='text-white hover:text-error p-2'
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                        {/* <DropdownMenu>
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
                                                        </DropdownMenu> */}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="8" className="text-center">
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

                {/* Diálogo de Bulk Edit */}
                <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bulk Edit Products</DialogTitle>
                            <DialogDescription>
                                Edit multiple products at once. Only filled fields will be updated.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Webhook Channel</Label>
                                <Select
                                    onValueChange={(value) => setNewEventChannelId(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select channel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {channels.map((channel) => (
                                            <SelectItem key={channel.id} value={channel.id}>
                                                {channel.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Role Ping</Label>
                                <Select
                                    onValueChange={(value) => setNewRolePing(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Max Price</Label>
                                <Input
                                    type="number"
                                    onChange={(e) => setNewEventMaxPrice(e.target.value)}
                                    placeholder="Enter max price"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Auto Delete Date</Label>
                                <Input
                                    type="date"
                                    onChange={(e) => setAutoDeleteDate(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    className="cursor-pointer border-gray-400"
                                    id="resell"
                                    checked={resell}
                                    onCheckedChange={setResell}
                                />
                                <Label htmlFor="resell">Resell</Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    const updates = {}
                                    if (newEventChannelId) updates.channel = newEventChannelId
                                    if (rolePing) updates.role = rolePing
                                    if (newEventMaxPrice) updates.max_price = Number(newEventMaxPrice)
                                    if (autoDeleteDate) updates.autodelete_event = autoDeleteDate
                                    if (resell !== null) updates.resell = resell
                                    handleBulkEdit(updates)
                                }}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Import Products from CSV</DialogTitle>
                            <DialogDescription>
                                Upload a CSV file with product data. The file should have the following columns:
                                name, url, max_price, channel, role, autodelete_event, resell
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <Input
                                className="bg-white cursor-pointer hover:bg-white/75"
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                            />

                            {importErrors.length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Validation Errors</AlertTitle>
                                    <AlertDescription>
                                        <ul className="list-disc pl-4">
                                            {importErrors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={() => setShowImportDialog(false)}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Import</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to import {importData?.length} products?
                                {importWarnings.length > 0 && (
                                    <Alert className="mt-4" variant="warning">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Warnings</AlertTitle>
                                        <AlertDescription>
                                            <ul className="list-disc pl-4">
                                                {importWarnings.map((warning, index) => (
                                                    <li key={index}>{warning}</li>
                                                ))}
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                onClick={() => setShowImportConfirm(false)}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                            >
                                Import Anyway
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {loading && <Loader />} {/* Muestra un spinner de carga si loading es true */}
            </div>
        </main>
    )
}
