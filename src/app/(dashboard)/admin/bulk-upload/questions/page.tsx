'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BulkUploadModal } from '@/components/admin/bulk-upload/BulkUploadModal'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

export default function BulkUploadQuestionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadHistory, setUploadHistory] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUploadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_upload_history')
        .select(`
          *,
          quiz:quiz_id (
            title
          ),
          user:created_by (
            email
          )
        `)
        .eq('type', 'questions')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUploadHistory(data || [])
    } catch (error) {
      console.error('Error fetching upload history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUploadHistory()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bulk Upload Questions</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Questions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : uploadHistory.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No upload history found
            </div>
          ) : (
            <div className="space-y-4">
              {uploadHistory.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{upload.file_name}</h3>
                    <p className="text-sm text-gray-500">
                      Quiz: {upload.quiz?.title || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Questions: {upload.questions_count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {upload.user?.email || 'Unknown user'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(upload.created_at), 'PPp')}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        upload.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {upload.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BulkUploadModal
        type="questions"
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) {
            fetchUploadHistory()
          }
        }}
      />
    </div>
  )
}
