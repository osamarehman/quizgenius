'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BulkUploadModal } from '@/components/admin/bulk-upload/BulkUploadModal'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type UploadHistory = Database['public']['Tables']['bulk_upload_history']['Row']

export default function BulkUploadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchUploadHistory()
  }, [])

  const fetchUploadHistory = async () => {
    const { data, error } = await supabase
      .from('bulk_upload_history')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setUploadHistory(data)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      completed: 'bg-green-500',
      processing: 'bg-yellow-500',
      failed: 'bg-red-500',
    }

    return (
      <Badge className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bulk Upload Questions</h1>
        <Button onClick={() => setIsModalOpen(true)}>Upload CSV</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Questions Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quiz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadHistory.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell>{upload.file_name}</TableCell>
                  <TableCell>
                    {format(new Date(upload.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{upload.questions_count}</TableCell>
                  <TableCell>{getStatusBadge(upload.status)}</TableCell>
                  <TableCell>{upload.quiz_name}</TableCell>
                </TableRow>
              ))}
              {uploadHistory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No upload history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BulkUploadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchUploadHistory()
        }}
      />
    </div>
  )
}
