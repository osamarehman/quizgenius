'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Layout, 
  FileText, 
  Database,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function QuizSidebar() {
  return (
    <div className="w-64 border-r bg-muted/10">
      <Tabs defaultValue="questions" className="h-full">
        <TabsList className="grid grid-cols-4 h-12">
          <TabsTrigger value="questions">
            <Layout className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image
              src="/image-url"
              alt="Media preview"
              width={20}
              height={20}
              className="h-4 w-4"
            />
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="bank">
            <Database className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-3rem)]">
          <div className="p-4">
            <TabsContent value="questions" className="m-0">
              <div className="space-y-4">
                <Link href="/admin/quizzes/create" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Quiz
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Multiple Choice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  True/False
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Short Answer
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="media" className="m-0">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Image
                    src="/image-url"
                    alt="Upload image"
                    width={20}
                    height={20}
                    className="mr-2 h-4 w-4"
                  />
                  Upload Image
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  {/* Media library preview grid */}
                  <Image
                    src="/image-url"
                    alt="Media preview"
                    width={200}
                    height={150}
                    className="w-full h-auto rounded-md"
                  />
                  <Image
                    src="/image-url"
                    alt="Media preview"
                    width={200}
                    height={150}
                    className="w-full h-auto rounded-md"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="m-0">
              <div className="space-y-4">
                {/* Template list */}
              </div>
            </TabsContent>

            <TabsContent value="bank" className="m-0">
              <div className="space-y-4">
                {/* Question bank */}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
} 