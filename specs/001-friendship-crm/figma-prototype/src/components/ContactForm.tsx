import { useState } from 'react';
import { Box, Typography, Button, Card, TextField, Chip, MenuItem, FormControl, InputLabel, Select, OutlinedInput } from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';
import { Contact } from '../App';

interface ContactFormProps {
  contact?: Contact;
  onSave: (contact: any) => void;
  onCancel: () => void;
  onDelete?: (contactId: string) => void;
}

const AVAILABLE_TAGS = [
  'Family',
  'Close friend',
  'Old friend',
  'Acquaintance',
  'Colleague',
  'Neighbor',
  'College',
  'Childhood',
  'Book club',
  'Gym',
  'Sports',
];

export default function ContactForm({ contact, onSave, onCancel, onDelete }: ContactFormProps) {
  const [name, setName] = useState(contact?.name || '');
  const [birthday, setBirthday] = useState(contact?.birthday || '');
  const [profileNote, setProfileNote] = useState(contact?.profileNote || '');
  const [tags, setTags] = useState<string[]>(contact?.tags || []);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { name?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const contactData = {
      ...(contact || {}),
      name: name.trim(),
      birthday: birthday || undefined,
      profileNote: profileNote.trim(),
      tags,
    };

    onSave(contactData);
  };

  const isEditing = !!contact;

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={onCancel}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Cancel
      </Button>

      {/* Form Card */}
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          {isEditing ? `Edit ${contact.name}` : 'Add New Contact'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          {isEditing 
            ? 'Update the details for this contact. All fields except name are optional.'
            : 'Add someone special to your network. The more you share, the better we can help you stay connected!'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name */}
            <TextField
              label="Name"
              placeholder="e.g., Sarah Chen"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              required
              fullWidth
              error={!!errors.name}
              helperText={errors.name || 'What should we call them?'}
            />

            {/* Birthday */}
            <TextField
              label="Birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="We'll help you remember to wish them a happy birthday!"
            />

            {/* Profile Note */}
            <TextField
              label="Profile Note"
              placeholder="e.g., College roommate, loves hiking and photography. Always up for brunch on weekends."
              value={profileNote}
              onChange={(e) => setProfileNote(e.target.value)}
              fullWidth
              multiline
              rows={4}
              helperText="Jot down anything that helps you remember them - interests, how you met, conversation starters, etc."
            />

            {/* Tags */}
            <FormControl fullWidth>
              <InputLabel>Relationship Tags</InputLabel>
              <Select
                multiple
                value={tags}
                onChange={(e) => setTags(e.target.value as string[])}
                input={<OutlinedInput label="Relationship Tags" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value}
                        size="small"
                        sx={{ bgcolor: 'rgba(100, 181, 246, 0.15)', color: 'secondary.main' }}
                      />
                    ))}
                  </Box>
                )}
              >
                {AVAILABLE_TAGS.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                {isEditing ? 'Save Changes' : 'Add Contact'}
              </Button>
              <Button
                variant="outlined"
                onClick={onCancel}
                size="large"
                fullWidth
              >
                Cancel
              </Button>
            </Box>

            {/* Delete Button (only for editing) */}
            {isEditing && onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${contact.name}? This action cannot be undone.`)) {
                    onDelete(contact.id);
                  }
                }}
                sx={{ mt: 2 }}
              >
                Delete Contact
              </Button>
            )}
          </Box>
        </form>
      </Card>
    </Box>
  );
}