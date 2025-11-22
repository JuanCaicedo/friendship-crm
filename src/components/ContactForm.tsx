'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import { useCreateContact, useUpdateContact } from '@/hooks/useContactMutations';
import { CreateContactParams, Contact } from '@/lib/models';
import { useTags } from '@/hooks/useTags';

interface ContactFormProps {
  contact?: Contact;
}

export function ContactForm({ contact }: ContactFormProps) {
  const router = useRouter();
  const { createContact, isCreating, error: createError } = useCreateContact();
  const { updateContact, isUpdating, error: updateError } = useUpdateContact();
  const { tags, isLoading: tagsLoading, isError: tagsError, error: tagsErrorObj } = useTags();

  const [formData, setFormData] = useState<CreateContactParams>({
    name: contact?.name || '',
    birthday: contact?.birthday || undefined,
    profileNote: contact?.profileNote || undefined,
    tagIds: contact?.tags?.map((t) => t.id) || [],
  });

  const error = createError || updateError;
  const isSubmitting = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (contact) {
        await updateContact({
          id: contact.id,
          params: {
            name: formData.name,
            birthday: formData.birthday || null,
            profileNote: formData.profileNote || null,
          },
        });
      } else {
        await createContact(formData);
      }
      router.push('/contacts');
    } catch (err) {
      console.error('Failed to save contact:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'Couldn\'t save contact. Please try again.'}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Birthday"
        type="date"
        value={formData.birthday || ''}
        onChange={(e) => setFormData({ ...formData, birthday: e.target.value || undefined })}
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Profile Note"
        multiline
        rows={4}
        value={formData.profileNote || ''}
        onChange={(e) => setFormData({ ...formData, profileNote: e.target.value || undefined })}
        sx={{ mb: 2 }}
        helperText="Add a note to help you remember context about this person"
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tags</InputLabel>
        {tagsError ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {tagsErrorObj?.message || 'Couldn\'t load tags. Please try again.'}
          </Alert>
        ) : tagsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Select
            multiple
            value={formData.tagIds || []}
            onChange={(e) => setFormData({ ...formData, tagIds: e.target.value as number[] })}
            input={<OutlinedInput label="Tags" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as number[]).map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <Chip key={tagId} label={tag.name} size="small" />
                  ) : null;
                })}
              </Box>
            )}
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting || !formData.name.trim()}
        fullWidth
      >
        {isSubmitting ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
      </Button>
    </Box>
  );
}

