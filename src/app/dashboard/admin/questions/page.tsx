import { Metadata } from "next"
import { QuestionBankClient } from "./QuestionBankClient"

export const metadata: Metadata = {
  title: "Question Bank",
  description: "View and manage all questions in the system.",
}

export default function QuestionBankPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Question Bank</h2>
      </div>
      <div className="space-y-4">
        <QuestionBankClient />
      </div>
    </div>
  )
}
