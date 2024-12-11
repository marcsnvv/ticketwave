"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "../../../supabase"

export default function CreateCompany({ onCompanyCreated, userData }) {
    const [loading, setLoading] = useState(false)
    const [companyName, setCompanyName] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // console.log("User data:", userData)

        try {
            // Insert company
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .insert([{ name: companyName }])
                .select()

            if (companyError) throw companyError

            console.log("Company data:", company)

            // Update user with company_id
            const { error: userError } = await supabase
                .from('users')
                .insert([{
                    name: userData.user_metadata.full_name,
                    email: userData.email,
                    avatar_url: userData.user_metadata.avatar_url,
                    company_id: company[0].company_id,
                }])

            if (userError) throw userError

            localStorage.setItem('company_id', company.id)
            onCompanyCreated(company.id)

        } catch (error) {
            console.error('Error creating company:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Create Company</CardTitle>
                <CardDescription>
                    Set up your company to start monitoring events
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Company name"
                                className="pl-8"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating..." : "Create Company"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
