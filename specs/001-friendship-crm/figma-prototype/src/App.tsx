import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container } from '@mui/material';
import Dashboard from './components/Dashboard';
import ContactList from './components/ContactList';
import ContactDetail from './components/ContactDetail';
import ContactForm from './components/ContactForm';
import LogInteraction from './components/LogInteraction';
import Navigation from './components/Navigation';

// Define the warm, friendly theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3', // Friendly Blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#64B5F6', // Light Blue
      contrastText: '#fff',
    },
    background: {
      default: '#F5F9FF', // Light Blue-tinted Background
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFC107',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export interface Contact {
  id: string;
  name: string;
  birthday?: string;
  profileNote: string;
  tags: string[];
  health: 'healthy' | 'attention' | 'overdue';
  lastInteraction?: string;
  archived?: boolean;
}

export interface Interaction {
  id: string;
  contactId: string;
  type: 'text' | 'call' | 'hangout';
  date: string;
  notes?: string;
  weight: number;
}

export interface Reminder {
  id: string;
  contactId: string;
  message: string;
  date: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'contacts' | 'contact-detail' | 'add-contact' | 'edit-contact' | 'log-interaction'>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      birthday: '1992-05-15',
      profileNote: 'College roommate, loves hiking and photography. Always up for brunch on weekends.',
      tags: ['Close friend', 'College'],
      health: 'healthy',
      lastInteraction: '2025-11-18',
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      birthday: '1988-09-22',
      profileNote: 'Childhood friend from the neighborhood. Works in tech, plays guitar.',
      tags: ['Old friend', 'Childhood'],
      health: 'attention',
      lastInteraction: '2025-10-15',
    },
    {
      id: '3',
      name: 'Emma Watson',
      birthday: '1995-03-08',
      profileNote: 'Met at a book club. Loves sci-fi novels and has two cats.',
      tags: ['Acquaintance', 'Book club'],
      health: 'overdue',
      lastInteraction: '2025-08-20',
    },
    {
      id: '4',
      name: 'David Kim',
      birthday: '1990-11-30',
      profileNote: 'Brother - lives across the country but we try to stay in touch regularly.',
      tags: ['Family'],
      health: 'healthy',
      lastInteraction: '2025-11-19',
    },
  ]);
  
  const [interactions, setInteractions] = useState<Interaction[]>([
    { id: '1', contactId: '1', type: 'hangout', date: '2025-11-18', notes: 'Brunch at the new cafe downtown', weight: 6 },
    { id: '2', contactId: '1', type: 'text', date: '2025-11-10', notes: 'Shared some photos', weight: 1 },
    { id: '3', contactId: '2', type: 'call', date: '2025-10-15', notes: 'Caught up on life', weight: 3 },
    { id: '4', contactId: '3', type: 'text', date: '2025-08-20', weight: 1 },
    { id: '5', contactId: '4', type: 'call', date: '2025-11-19', notes: 'Weekly family check-in', weight: 3 },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', contactId: '3', message: 'Check in about her new job', date: '2025-11-25' },
  ]);

  const handleNavigate = (view: typeof currentView, contactId?: string) => {
    setCurrentView(view);
    if (contactId) {
      setSelectedContactId(contactId);
    }
  };

  const handleAddContact = (contact: Omit<Contact, 'id' | 'health' | 'lastInteraction'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      health: 'healthy',
    };
    setContacts([...contacts, newContact]);
    setCurrentView('contacts');
  };

  const handleEditContact = (contact: Contact) => {
    setContacts(contacts.map(c => c.id === contact.id ? contact : c));
    setCurrentView('contact-detail');
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter(c => c.id !== contactId));
    setCurrentView('contacts');
  };

  const handleLogInteraction = (interaction: Omit<Interaction, 'id'>) => {
    const newInteraction: Interaction = {
      ...interaction,
      id: Date.now().toString(),
    };
    setInteractions([...interactions, newInteraction]);
    
    // Update contact's last interaction and health
    setContacts(contacts.map(c => {
      if (c.id === interaction.contactId) {
        return {
          ...c,
          lastInteraction: interaction.date,
          health: 'healthy' as const,
        };
      }
      return c;
    }));
    
    setCurrentView(currentView === 'log-interaction' ? 'dashboard' : 'contact-detail');
  };

  const handleArchiveContact = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, archived: true } : c
    ));
    setCurrentView('contacts');
  };

  const handleAddReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders([...reminders, newReminder]);
  };

  const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Navigation currentView={currentView} onNavigate={handleNavigate} />
        <Container maxWidth="md" sx={{ py: 4 }}>
          {currentView === 'dashboard' && (
            <Dashboard 
              contacts={contacts} 
              interactions={interactions}
              reminders={reminders}
              onNavigate={handleNavigate}
              onLogInteraction={(contactId) => {
                setSelectedContactId(contactId);
                handleNavigate('log-interaction');
              }}
              onAddReminder={handleAddReminder}
              onViewContact={(contactId) => {
                setSelectedContactId(contactId);
                handleNavigate('contact-detail');
              }}
            />
          )}
          
          {currentView === 'contacts' && (
            <ContactList 
              contacts={contacts.filter(c => !c.archived)}
              onNavigate={handleNavigate}
              onSelectContact={(contactId) => {
                setSelectedContactId(contactId);
                handleNavigate('contact-detail');
              }}
            />
          )}
          
          {currentView === 'contact-detail' && selectedContact && (
            <ContactDetail 
              contact={selectedContact}
              interactions={interactions.filter(i => i.contactId === selectedContact.id)}
              reminders={reminders.filter(r => r.contactId === selectedContact.id)}
              onNavigate={handleNavigate}
              onEdit={() => handleNavigate('edit-contact')}
              onArchive={handleArchiveContact}
              onLogInteraction={() => handleNavigate('log-interaction')}
              onAddReminder={handleAddReminder}
            />
          )}
          
          {currentView === 'add-contact' && (
            <ContactForm 
              onSave={handleAddContact}
              onCancel={() => handleNavigate('contacts')}
            />
          )}
          
          {currentView === 'edit-contact' && selectedContact && (
            <ContactForm 
              contact={selectedContact}
              onSave={handleEditContact}
              onCancel={() => handleNavigate('contact-detail')}
              onDelete={handleDeleteContact}
            />
          )}
          
          {currentView === 'log-interaction' && selectedContact && (
            <LogInteraction 
              contact={selectedContact}
              onSave={handleLogInteraction}
              onCancel={() => handleNavigate(selectedContactId ? 'contact-detail' : 'dashboard')}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;