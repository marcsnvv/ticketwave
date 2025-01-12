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
    { "value": "queue.ticketmaster.com", "label": "TM Queue" },
    { "value": "ticketportal.cz", "label": "Ticketportal.cz" },
    { "value": "eventim.de", "label": "Eventim.de" },
    { "value": "ticketone.it", "label": "Ticketone.it" },
    { "value": "ticketcorner.ch", "label": "Ticketcorner.ch" },
    { "value": "oeticket.com", "label": "Oeticket.com" },
    { "value": "eticketing.co.uk", "label": "Eticketing.co.uk" },

]

export default function LogsSection() {
    const [logsData, setLogsData] = useState({ filename: '', total_lines: 0, lines: [] })
    const [loading, setLoading] = useState(true)
    const [selectedMonitor, setSelectedMonitor] = useState('ticketmaster.ae')
    const [newLogs, setNewLogs] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

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

    const filteredLogs = logsData.lines.filter(line => {
        const { message } = parseLine(line)
        return message.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const forceRefresh = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://ticketwave-api.fly.dev/logs?filename=${selectedMonitor}.log`, {
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
            // Espera 1 segundo antes de cambiar el estado de loading
            setTimeout(() => setLoading(false), 1000)
        }
    }

    useEffect(() => {
        setLogsData(prevData => ({
            ...prevData,
            lines: [...newLogs, ...prevData.lines]
        }))
    }, [newLogs])

    useEffect(() => {
        async function fetchInitialLogs() {
            setLoading(true)
            try {
                const response = await fetch(`https://ticketwave-api.fly.dev/logs?filename=${selectedMonitor}.log`, {
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

        // Ejecutar fetchInitialLogs inmediatamente
        fetchInitialLogs()
    }, [selectedMonitor])

    useEffect(() => {
        async function fetchLogs() {
            try {
                const response = await fetch(`https://ticketwave-api.fly.dev/logs?filename=${selectedMonitor}.log`, {
                    method: 'GET',
                    headers: {
                        'X-API-KEY': 'T!CK3TW@V3M0N1T0R$',
                        'Content-Type': 'application/json',
                    }
                })
                const data = await response.json()
                if (logsData.total_lines < data.total_lines) {
                    const newLines = data.lines.slice(logsData.total_lines)
                    setNewLogs(newLines)
                    setLogsData(prevData => ({
                        ...prevData,
                        total_lines: data.total_lines,
                        lines: [...newLines, ...prevData.lines]
                    }))
                }
            } catch (error) {
                console.error('Error fetching logs:', error)
            }
        }

        // Configurar el intervalo para actualizar cada 5 segundos
        const interval = setInterval(fetchLogs, 5000)

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(interval)
    }, [logsData.total_lines, selectedMonitor])

    return (
        <Card className='p-4 border rounded-lg'>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex justify-between items-center">
                    <Title>System Logs</Title>
                    <Badge variant="outline">
                        {logsData.filename} ({logsData.total_lines} lines)
                    </Badge>
                    <Button
                        variant="outline"
                        onClick={forceRefresh}>
                        <div className={loading ? 'animate-spin' : ''}>
                            <RefreshCw />
                        </div>
                    </Button>
                </div>
                <Select
                    value={selectedMonitor}
                    onValueChange={setSelectedMonitor}
                >
                    <SelectTrigger className="w-[280px]">
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
                <Input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-4"
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-48">Timestamp</TableHead>
                        <TableHead>Message</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
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
                                    <TableCell className="font-mono text-sm">
                                        {timestamp}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`${isError ? 'text-red-600' : ''}`}>
                                            {message}
                                        </span>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </Card>
    )
}
