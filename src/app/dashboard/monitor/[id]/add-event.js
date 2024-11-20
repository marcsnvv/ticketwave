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
import { useState } from "react";

export default function AddEvent({
    addEvent,
    setAddEvent,
    newEventName,
    setNewEventName,
    newEventMaxPrice,
    setNewEventMaxPrice,
    newEventUrl,
    setNewEventUrl,
    newEventWebhookUrl,
    setNewEventWebhookUrl,
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
    error
}) {
    const [openCalendar, setOpenCalendar] = useState(false)
    const [webhookTitle, setWebhookTitle] = useState("Select webhook")
    const [roleTitle, setRoleTitle] = useState("Select role")

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
                                            {webhookTitle}
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
                                                            value={channel.title}
                                                            onSelect={() => {
                                                                const webhookValue = newEventWebhookUrl === channel.webhook_url ? "" : channel.webhook_url
                                                                setNewEventWebhookUrl(webhookValue)
                                                                setWebhookTitle(channel.title)
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
                                                {roleTitle}
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
                                                                value={role.title}
                                                                onSelect={() => {
                                                                    const roleId = rolePing === role.role_id ? "" : role.role_id
                                                                    setNewRolePing(roleId)
                                                                    setRoleTitle(role.title)
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