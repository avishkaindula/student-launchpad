import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { BottomTabInset, MaxContentWidth, Spacing, TopTabInset } from '@/constants/theme';
import { showAlert } from '@/lib/alert';
import type { Tables } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

// The shape of one row in the `notes` table (generated from the database).
type Note = Tables<'notes'>;

/**
 * Home tab: a simple list of the signed-in user's notes.
 * Row Level Security in the database makes sure each user only gets their own notes,
 * so there is no need to filter by user here.
 */
export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load the notes when the screen opens, and again on pull-to-refresh.
  const [refreshCount, setRefreshCount] = useState(0);
  useEffect(() => {
    supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setErrorMessage(error?.message ?? null);
        setNotes(data ?? []);
        setLoading(false);
      });
  }, [refreshCount]);

  function refresh() {
    setLoading(true);
    setRefreshCount((count) => count + 1);
  }

  async function addNote() {
    const content = newNote.trim();
    if (!content) return;

    setSaving(true);
    // `user_id` is filled in by the database (it defaults to the signed-in user).
    const { data, error } = await supabase.from('notes').insert({ content }).select().single();
    setSaving(false);

    if (error) {
      showAlert('Could not save note', error.message);
      return;
    }
    setNotes((current) => [data, ...current]);
    setNewNote('');
  }

  async function deleteNote(id: number) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) {
      showAlert('Could not delete note', error.message);
      return;
    }
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="subtitle">My notes</ThemedText>
          <View style={styles.form}>
            <TextField
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Write a note..."
              onSubmitEditing={addNote}
              returnKeyType="done"
              maxLength={1000}
              containerStyle={styles.input}
            />
            <Button title="Add" onPress={addNote} loading={saving} disabled={!newNote.trim()} />
          </View>
          {errorMessage ? (
            <ThemedText type="small" themeColor="danger">
              {errorMessage}
            </ThemedText>
          ) : null}
        </View>

        <FlatList
          data={notes}
          keyExtractor={(note) => String(note.id)}
          refreshing={loading}
          onRefresh={refresh}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            loading ? undefined : (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                No notes yet. Add your first one above.
              </ThemedText>
            )
          }
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.note}>
              <View style={styles.noteText}>
                <ThemedText>{item.content}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(item.created_at).toLocaleString()}
                </ThemedText>
              </View>
              <Button title="Delete" variant="danger" onPress={() => deleteNote(item.id)} />
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingTop: TopTabInset,
  },
  header: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  form: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
  },
  list: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.five,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  noteText: {
    flex: 1,
    gap: Spacing.one,
  },
});
