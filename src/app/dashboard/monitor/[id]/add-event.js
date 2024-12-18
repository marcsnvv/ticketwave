"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckIcon, ChevronDownIcon, CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils"
import Image from "next/image"
import { supabase } from "../../../../../supabase";

export default function AddEvent({
    addEvent,
    setAddEvent,
    newEventName,
    setNewEventName,
    newEventMaxPrice,
    setNewEventMaxPrice,
    newEventUrl,
    setNewEventUrl,
    newEventChannelId,
    setNewEventChannelId,
    openWebhook,
    setOpenWebhook,
    channels,
    roles,
    rolePing,
    setNewRolePing,
    openRole,
    setOpenRole,
    resell,
    setResell,
    autoDeleteDate,
    setAutoDeleteDate,
    handleAddEvent,
    error,
    monitorType, // Añadir este prop
}) {
    const [openCalendar, setOpenCalendar] = useState(false)
    const [webhookTitle, setWebhookTitle] = useState("Select webhook")
    const [roleTitle, setRoleTitle] = useState("Select role")
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [openWebhookSelect, setOpenWebhookSelect] = useState(false)  // Añadir este estado
    const [searchTerm, setSearchTerm] = useState("")

    // Añadir el useEffect para el debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (monitorType.includes('ticketmaster')) {
                searchTicketmaster(searchTerm)
            } else if (monitorType.includes('eventim')) {
                searchEventim(searchTerm)
            }
        }, 300) // 300ms de delay

        return () => clearTimeout(timeoutId) // Limpieza del timeout
    }, [searchTerm, monitorType])

    const searchEventim = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 3) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`https://public-api.eventim.com/websearch/search/api/exploration/v2/productGroups?webId=web__eventim-de&search_term=${encodeURIComponent(searchTerm)}&language=de&retail_partner=EVE&sort=Recommendation&auto_suggest=true`)
            const data = await response.json()

            // Modificar esta parte para manejar el caso de no resultados
            const results = data.productGroups || []
            setSearchResults(results)
        } catch (error) {
            console.error('Error searching events:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const searchTicketmaster = async (searchTerm) => {
        if (!searchTerm || searchTerm.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const region = monitorType.split(".")[1]
            // Posibles locale; es, de, nl, pl, co.uk, etc.
            let countryCode = 'US'
            if (!region) {
                console.error('Error searching events: Invalid region')
                setSearchResults([])
                return
            } else if (region.includes('uk')) {
                countryCode = 'GB'
            } else {
                countryCode = region.toUpperCase()
            }

            const apikeys = [
                "Jl3DTIoeq2jaGjIue8OHxVINLAMdP4vL",
                "tbNFigIf0gl2whzkuE0w1301KAqFlTGW",
                "s3aH6zPmoGPFJsNDpHAQEGZrpC7RZ7C5",
                "l73WtjKgx7NK1sq9GRE5nfMGrRxBsiEy"
            ]
            const endpoint = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${encodeURIComponent(searchTerm)}&countryCode=${countryCode}&apikey=${apikeys[Math.floor(Math.random() * apikeys.length)]}`
            const response = await fetch(endpoint)
            const data = await response.json()

            // Modificar esta parte para manejar el caso de no resultados
            const events = data._embedded?.events || []
            setSearchResults(events)
        } catch (error) {
            console.error('Error searching events:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const handleEventSelect = (event) => {
        setNewEventName(event.name)

        // Manejar URLs según el tipo de monitor
        if (monitorType.includes('ticketmaster')) {
            setNewEventUrl(event.url)
            // Si hay rangos de precios disponibles, usar el máximo
            if (event.priceRanges?.[0]) {
                setNewEventMaxPrice(event.priceRanges[0].max)
            }

            // Establecer fecha de auto-eliminación para Ticketmaster
            if (event.dates?.start?.localDate) {
                const eventDate = new Date(event.dates.start.localDate)
                const nextDay = new Date(eventDate)
                nextDay.setDate(eventDate.getDate() + 1)
                setAutoDeleteDate(nextDay.toISOString())
            }
        } else if (monitorType === 'eventim.de') {
            setNewEventUrl(event.link)

            // Establecer fecha de auto-eliminación para Eventim
            if (event.startDate) {
                const eventDate = new Date(event.startDate)
                const nextDay = new Date(eventDate)
                nextDay.setDate(eventDate.getDate() + 1)
                setAutoDeleteDate(nextDay.toISOString())
            }
        }

        setSearchResults([])
    }

    // Modificar la función de búsqueda según el tipo de monitor
    const handleSearch = (value) => {
        setNewEventName(value)
        setSearchTerm(value)
    }

    return (
        <>
            {addEvent && (
                <Dialog open={Boolean(addEvent)} onOpenChange={() => setAddEvent(null)}>
                    <DialogTrigger asChild>
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
                                <div className="grid gap-4 w-full">
                                    <Label htmlFor="event-name">
                                        Name *
                                    </Label>
                                    {(monitorType.includes('ticketmaster') || monitorType === 'eventim.de') ? (
                                        <div className="relative">
                                            <Input
                                                id="event-name"
                                                value={newEventName}
                                                onChange={(e) => {
                                                    handleSearch(e.target.value)
                                                    setNewEventName(e.target.value) // Asegurarnos de que el valor se actualice siempre
                                                }}
                                                className="col-span-3"
                                            />
                                            {isSearching ? (
                                                <div className="absolute w-full mt-1 bg-background rounded-md border shadow-lg p-4">
                                                    Searching...
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <div className="absolute w-full mt-1 bg-background rounded-md border shadow-lg max-h-96 overflow-auto z-50">
                                                    {searchResults.map((event) => (
                                                        <div
                                                            key={monitorType.includes('ticketmaster') ? event.id : event.productGroupId}
                                                            className="p-2 hover:bg-gray-900 cursor-pointer flex items-center gap-3"
                                                            onClick={() => handleEventSelect(event)}
                                                        >
                                                            {((monitorType.includes('ticketmaster') ? event.images?.[0]?.url : event.imageUrl)) && (
                                                                <img
                                                                    src={monitorType.includes('ticketmaster') ? event.images[0].url : event.imageUrl}
                                                                    alt={event.name}
                                                                    className="w-12 h-12 object-cover rounded"
                                                                />
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{event.name}</span>
                                                                <span className="text-sm text-gray-500">
                                                                    {monitorType.includes('ticketmaster')
                                                                        ? new Date(event.dates?.start?.localDate).toLocaleDateString()
                                                                        : new Date(event.startDate).toLocaleDateString()
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <Input
                                            id="event-name"
                                            value={newEventName}
                                            onChange={(e) => setNewEventName(e.target.value)}
                                            className="col-span-3"
                                        />
                                    )}
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
                                <Popover open={openWebhookSelect} onOpenChange={setOpenWebhookSelect}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {webhookTitle}
                                            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search webhook..." className="h-9" />
                                            <CommandList className="max-h-[300px] overflow-auto">
                                                <CommandEmpty>No webhook found.</CommandEmpty>
                                                <CommandGroup className="overflow-auto">
                                                    {channels.sort((a, b) => a.title.localeCompare(b.title)).map((channel) => (
                                                        <CommandItem
                                                            key={channel.id}
                                                            value={channel.title}
                                                            onSelect={() => {
                                                                setNewEventChannelId(channel.id);
                                                                setWebhookTitle(channel.title);
                                                                setOpenWebhookSelect(false);
                                                            }}
                                                        >
                                                            {channel.title}
                                                            <CheckIcon
                                                                className={`ml-auto h-4 w-4 ${newEventChannelId === channel.id ? "opacity-100" : "opacity-0"}`}
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
                                                {roleTitle}
                                                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search role..." className="h-9" />
                                                <CommandList className="max-h-[300px] overflow-auto">
                                                    <CommandEmpty>No role found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {roles.sort((a, b) => a.title.localeCompare(b.title)).map((role) => (
                                                            <CommandItem
                                                                key={role.id}
                                                                value={role.title}
                                                                onSelect={() => {
                                                                    const roleId = rolePing === role.id ? "" : role.id
                                                                    setNewRolePing(roleId)
                                                                    setRoleTitle(role.title)
                                                                    setOpenRole(false)
                                                                }}
                                                            >
                                                                {role.title}
                                                                <CheckIcon
                                                                    className={`ml-auto h-4 w-4 ${rolePing === role.id ? "opacity-100" : "opacity-0"}`}
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
                                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className="w-full justify-between"
                                        >
                                            {autoDeleteDate ? (
                                                format(new Date(autoDeleteDate), "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={autoDeleteDate ? new Date(autoDeleteDate) : new Date()}
                                            onSelect={(date) => {
                                                setAutoDeleteDate(date.toISOString());
                                                setOpenCalendar(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <DialogFooter>
                            {error && <span className="text-red-500 text-sm">{error}</span>}
                            <Button type="button" onClick={handleAddEvent}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}