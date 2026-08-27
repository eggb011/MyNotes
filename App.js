import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'my-notes';

export default function App() {
  const [text, setText] = useState('');
  const [notes, setNotes] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved notes once, when the app starts
  useEffect(() => {
    async function loadNotes() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          setNotes(JSON.parse(saved));
        }
      } catch (e) {
        console.log('Failed to load notes', e);
      }
      setLoaded(true);
    }
    loadNotes();
  }, []);

  // Save notes every time they change (but not before the first load finishes)
  useEffect(() => {
    if (!loaded) return;
    console.log('Saving notes:', notes.length);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, loaded]);

  function addNote() {
    if (text.trim() === '') return;
    const newNote = { id: Date.now().toString(), content: text.trim() };
    setNotes([newNote, ...notes]);
    setText('');
  }

  function deleteNote(id) {
    setNotes(notes.filter((note) => note.id !== id));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="auto" />
      <Text style={styles.title}>My Notes v2</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Write a note..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No notes yet. Add one above!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.note}
            onLongPress={() => deleteNote(item.id)}
          >
            <Text style={styles.noteText}>{item.content}</Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#4a6cf7',
    borderRadius: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  note: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteText: {
    fontSize: 16,
  },
});