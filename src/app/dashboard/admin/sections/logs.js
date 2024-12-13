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
    { "value": "ticketmaster.cz", "label": "Ticketmaster.cz" },
    { "value": "ticketmaster.co.za", "label": "Ticketmaster.co.za" },
    { "value": "ticketmaster.com", "label": "Ticketmaster.com" },
    { "value": "axs.com", "label": "Axs.com" },
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

    useEffect(() => {
        async function fetchLogs() {
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

        // Ejecutar fetchLogs inmediatamente
        fetchLogs()

        // Configurar el intervalo para actualizar cada 5 segundos
        const interval = setInterval(fetchLogs, 5000)

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(interval)
    }, [selectedMonitor])

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

    return (
        <Card className='p-4 border rounded-lg'>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex justify-between items-center">
                    <Title>System Logs</Title>
                    <Badge variant="outline">
                        {logsData.filename} ({logsData.total_lines} lines)
                    </Badge>
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
            </div>

            {loading ? (
                <div className="text-center">Loading logs...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-48">Timestamp</TableHead>
                            <TableHead>Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logsData.lines.map((line, index) => {
                            const { timestamp, message, isError } = parseLine(line);
                            return (
                                <TableRow key={index}>
                                    <TableCell className="font-mono text-sm">
                                        {timestamp}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`${isError ? 'text-red-600' : ''}`}>
                                            {message}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </Card>
    )
}
