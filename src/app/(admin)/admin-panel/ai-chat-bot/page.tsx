import { AdminCardPage } from '@/components/admin/AdminManagementPage'

const aiChatBots = [
  { title: 'AI Chat Bot title', description: 'This is AI chat bot short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'AI Chat Bot title', description: 'This is AI chat bot short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'AI Chat Bot title', description: 'This is AI chat bot short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'draft' },
  { title: 'AI Chat Bot title', description: 'This is AI chat bot short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
  { title: 'AI Chat Bot title', description: 'This is AI chat bot short display descriptions...', author: 'admin@orienda.com', updated: '2 days ago', status: 'published' },
]

export default function AIChatBotPage() {
  return (
    <AdminCardPage
      title="AI Chat Bot"
      breadcrumb="Content > AI Chat Bot"
      searchPlaceholder="Search AI chat bot..."
      primaryActionLabel="Add AI Chat Bot"
      cards={{
        items: aiChatBots,
        rowKey: (_item, index) => `aiChatBot-${index}`,
        actions: [
          { label: 'Preview AI Chat Bot', icon: 'view', tone: 'muted' },
          { label: 'Edit AI Chat Bot', icon: 'edit', tone: 'blue' },
          { label: 'Delete AI Chat Bot', icon: 'delete', tone: 'danger' },
        ],
      }}
    />
  )
}
