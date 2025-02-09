"use client"

import { useState, useEffect } from 'react'
import { Card, Title } from "@tremor/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input" // Importar el componente Input
import { Button } from "@/components/ui/button" // Importar el componente Button
import { RefreshCw } from 'lucide-react'
import { Calendar as CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"

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
    { "value": "seetickets.co.uk", "label": "Seetickets.co.uk" },
]

// Utility function to conditionally join class names
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function LogsSection() {
    const [logsData, setLogsData] = useState({ filename: '', total_lines: 0, lines: [] })
    const [loading, setLoading] = useState(true)
    const [selectedMonitor, setSelectedMonitor] = useState('viagogo.com')
    const [searchTerm, setSearchTerm] = useState('')
    const [maxLines, setMaxLines] = useState(50)
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [logStatus, setLogStatus] = useState('all')

    const parseLine = (line) => {
        const match = line.match(/\[(.*?)\](.*)/);
        if (match) {
            const timestamp = match[1];
            const message = match[2].trim();
            const isError = message.toLowerCase().includes('error');
            return { timestamp, message, isError };
        }
        return { timestamp: '', message: line, isError: false };
    }

    const filteredLogs = (logsData.lines || []).filter(line => {
        const { message, isError } = parseLine(line)
        const matchesSearchTerm = message.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = logStatus === 'all' || (logStatus === 'error' && isError) || (logStatus === 'info' && !isError)
        return matchesSearchTerm && matchesStatus
    })

    const forceRefresh = async () => {
        setLoading(true)
        try {
            const response = await fetch(buildApiUrl(), {
                method: 'GET',
                headers: {
                    'X-API-KEY': 'T!CK3TW@V3M0N1T0R$',
                    'Content-Type': 'application/json',
                }
            })
            const data = await response.json()
            setLogsData({
                filename: data.filename || '',
                total_lines: data.total_lines || 0,
                lines: data.lines || []
            })
        } catch (error) {
            console.error('Error fetching logs:', error)
            setLogsData({ filename: '', total_lines: 0, lines: [] }) // Reset to default on error
        } finally {
            setTimeout(() => setLoading(false), 1000)
        }
    }

    const buildApiUrl = () => {
        let url = `https://ticketwave-api.fly.dev/logs?filename=${selectedMonitor}.log&max_lines=${maxLines}`
        if (startDate && endDate) {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd')
            const formattedEndDate = format(endDate, 'yyyy-MM-dd')
            url += `&start_date=${formattedStartDate}&end_date=${formattedEndDate}`
        }
        return url
    }

    useEffect(() => {
        async function fetchInitialLogs() {
            setLoading(true)
            try {
                const response = await fetch(buildApiUrl(), {
                    method: 'GET',
                    headers: {
                        'X-API-KEY': 'T!CK3TW@V3M0N1T0R$',
                        'Content-Type': 'application/json',
                    }
                })
                const data = await response.json()
                setLogsData(data)
            } catch (error) {
                console.error('Error fetching logs:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialLogs()
    }, [selectedMonitor, maxLines, startDate, endDate])

    const resetConfiguration = () => {
        setSelectedMonitor('viagogo.com')
        setSearchTerm('')
        setMaxLines(50)
        setStartDate(null)
        setEndDate(null)
    }

    return (
        <div className='w-full text-white'>
            <div className='flex justify-between mb-2'>
                <Input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-[250px] w-full"
                />
                <div className='flex gap-2'>
                    <Select
                        value={logStatus}
                        onValueChange={setLogStatus}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select log status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={maxLines}
                        onValueChange={setMaxLines}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select number of lines" />
                        </SelectTrigger>
                        <SelectContent>
                            {[50, 100, 200, 500].map((lines) => (
                                <SelectItem key={lines} value={lines}>
                                    {lines} lines
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Popover
                        className="w-[150px]"
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                            >
                                {startDate ? format(startDate, "PPP") : <span>Select from</span>}
                                <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Popover className="w-[150px]">
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                )}
                            >
                                {endDate ? format(endDate, "PPP") : <span>Select to</span>}
                                <CalendarIcon className="mr-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Select
                        value={selectedMonitor}
                        onValueChange={setSelectedMonitor}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select a monitor" />
                        </SelectTrigger>
                        <SelectContent>
                            {websites.map((site) => (
                                <SelectItem key={site.value} value={site.value}>
                                    {site.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={resetConfiguration}
                    // className="ml-2"
                    >
                        Reset
                    </Button>
                </div>
            </div>

            <hr className='border-white/25 mb-2'></hr>

            <div className='bg-black rounded-[12px] border border-white/25'>
                <table className='font-mono w-full' style={{ maxHeight: '60vh', overflow: 'auto', display: 'block' }}>
                    <thead className='border-b border-white/25'>
                        <tr className='h-10'>
                            <th className="text-start px-5 py-3">Timestamp</th>
                            <th className='text-start px-5 py-3'>Message</th>
                            <th className='text-end text-nowrap px-5 py-3 text-sm text-white/50 flex items-center gap-2'>
                                {maxLines} lines
                                <button
                                    onClick={() => forceRefresh()}
                                    className={`
                                        p-2 text-white
                                    ${loading ? 'animate-spin' : ''}    
                                    `}
                                >
                                    <RefreshCw />
                                </button>
                            </th>
                        </tr>
                    </thead>

                    <tbody >
                        <AnimatePresence>
                            {filteredLogs.map((line, index) => {
                                const { timestamp, message, isError } = parseLine(line);
                                return (
                                    <motion.tr
                                        key={index}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td className="text-sm text-nowrap px-5 py-3">
                                            {timestamp}
                                        </td>
                                        <td>
                                            <span className={`px-5 py-3 text-sm ${isError ? 'text-error' : ''}`}>
                                                {message}
                                            </span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    )
}
