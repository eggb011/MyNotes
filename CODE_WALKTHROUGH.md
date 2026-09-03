# MyNotes — Code Walkthrough

An annotated tour of `App.js`, written while the app is small enough to
understand completely. Read this before adding a feature to remember where
things plug in.

---

## The one idea that explains everything

**State holds the data. The screen is drawn from the state. Change the state,
and the screen redraws itself.**

You never write code that says "update the screen." You change data, and React
re-runs the drawing code for you. Almost every question about "how does this
work" comes back to this loop.

```
user taps Add
      ↓
addNote() changes `notes` via setNotes()
      ↓
React notices `notes` changed
      ↓
React re-runs the return block
      ↓
FlatList draws the new list
```

---

## The file in five parts

`App.js` reads top to bottom in this order:

1. **Imports** — tools borrowed from elsewhere
2. **State** — the app's memory
3. **Effects** — code that runs at specific moments (this is where saving lives)
4. **Actions** — functions that change state
5. **Return block** — what appears on screen
6. **Styles** — how it looks

---

## 1. Imports

```javascript
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity,
         FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
```

Nothing here *does* anything — these lines just make tools available.

**From React:** `useState` and `useEffect`. These are "hooks" — special
functions that let a component have memory and side effects.

**From React Native — the visual building blocks:**

| Component | What it is |
|---|---|
| `View` | A container / box. The div of React Native. Groups and positions things. |
| `Text` | Words on screen. **All text must be inside a `Text`** — this is a hard rule and a common source of errors. |
| `TextInput` | A box the user types into. |
| `TouchableOpacity` | Anything tappable. Dims slightly when pressed. |
| `FlatList` | A scrolling list. Only renders what's visible, so it stays fast with many items. |
| `KeyboardAvoidingView` | Shifts content up so the on-screen keyboard doesn't cover the input. |
| `StyleSheet` | Used at the bottom to define appearance. |
| `Platform` | Lets code branch on iOS vs Android. |

**`AsyncStorage`** is the phone's small permanent storage box. It survives app
restarts. It stores **text only** — which is why `JSON.stringify` and
`JSON.parse` show up later.

---

## 2. State — the app's memory

```javascript
const STORAGE_KEY = 'my-notes';

const [text, setText] = useState('');
const [notes, setNotes] = useState([]);
const [loaded, setLoaded] = useState(false);
```

`STORAGE_KEY` is just a label for the storage slot, defined once as a constant so
the load and save code can't disagree about the spelling. Getting this wrong in
one place is a classic silent bug.

Each `useState` line creates one piece of watched memory. The pattern is always
`const [value, setValue] = useState(startingValue)`:

| State | Holds | Starts as |
|---|---|---|
| `text` | whatever is currently typed in the input box | `''` (empty string) |
| `notes` | the list of saved notes | `[]` (empty array) |
| `loaded` | whether the initial load from storage has finished | `false` |

**Critical rule:** only ever change state through its setter. Writing
`notes.push(...)` directly does *not* work — React won't notice, and the screen
won't update. Always `setNotes(...)` with a **new** array.

Each note is an object shaped like:

```javascript
{ id: '1757012345678', content: 'Buy milk' }
```

The `id` comes from `Date.now()` (milliseconds since 1970), which is a quick way
to get a unique value. `FlatList` needs a unique `id` per item to track rows
efficiently.

### Why `loaded` exists

This one isn't obvious. Without it, the save effect would fire on the very first
render — before the load from storage finished — and write the still-empty `[]`
over the real saved notes. `loaded` is a guard that says "don't save anything
until we've finished reading." A small flag preventing real data loss.

---

## 3. Effects — code that runs at specific moments

`useEffect` runs code *after* a render, at moments you specify. The array at the
end (the "dependency array") controls when.

### Load once at startup

```javascript
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
```

**`[]` at the end means: run this once, when the app first mounts.** An empty
dependency array means "nothing to watch, so never re-run."

Reading storage takes time, so it's asynchronous. `await` means "pause here
until this finishes, then continue." A function using `await` must be marked
`async` — hence the inner `async function loadNotes()`.

`getItem` returns `null` if nothing was ever saved (first launch), which is why
the `null` check exists. `JSON.parse` turns the stored text back into a real
array.

`setLoaded(true)` runs whether or not loading succeeded — it sits after the
`try/catch` deliberately. Otherwise a storage error would leave `loaded` stuck
at `false` and saving would never work again.

### Save whenever notes change

```javascript
useEffect(() => {
  if (!loaded) return;
  console.log('Saving notes:', notes.length);   // debug line — safe to delete
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}, [notes, loaded]);
```

**`[notes, loaded]` means: re-run this whenever either of those changes.**

`if (!loaded) return` is the guard described above — bail out before the initial
load has completed.

`JSON.stringify` converts the array into text, because AsyncStorage can only hold
text.

Note what *isn't* here: `addNote` and `deleteNote` don't save anything
themselves. They only change `notes`, and this effect notices and saves. That
separation means **any** future feature that modifies notes gets saving for free
— editing, reordering, bulk delete. Worth preserving.

The `console.log` was added for debugging and can be removed.

---

## 4. Actions

```javascript
function addNote() {
  if (text.trim() === '') return;
  const newNote = { id: Date.now().toString(), content: text.trim() };
  setNotes([newNote, ...notes]);
  setText('');
}
```

Line by line:

- `text.trim()` removes leading/trailing whitespace; the check rejects notes that
  are empty or only spaces.
- `Date.now().toString()` makes a unique id as a string.
- `[newNote, ...notes]` builds a **brand new array** with the new note first,
  then everything that was already there. The `...` is the spread operator —
  "unpack all the existing items here." New note first means newest appears at
  the top.
- `setText('')` clears the input box, ready for the next note.

```javascript
function deleteNote(id) {
  setNotes(notes.filter((note) => note.id !== id));
}
```

`filter` builds a new array containing only items where the test is true — here,
every note whose id is *not* the one being deleted. Again: a new array, not a
modification of the old one.

**The pattern in both:** never modify the existing array. Always build a new one
and hand it to the setter. This is how React knows something changed.

---

## 5. The return block — what appears on screen

```javascript
return (
  <KeyboardAvoidingView style={styles.container} behavior={...}>
    <StatusBar style="auto" />
    <Text style={styles.title}>My Notes v2</Text>

    <View style={styles.inputRow}>
      <TextInput ... />
      <TouchableOpacity style={styles.addButton} onPress={addNote}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>

    <FlatList ... />
  </KeyboardAvoidingView>
);
```

This reads **top to bottom like the screen**: title, then input row, then the
list. The nesting is the layout — things inside a `View` are grouped and
positioned by it.

The HTML-looking syntax is JSX. Curly braces `{ }` switch from markup back into
JavaScript, which is how values and functions get passed in.

> `My Notes v2` — the "v2" was a temporary debug marker to prove new code was
> running. Safe to revert to `My Notes`.

### The input

```javascript
<TextInput
  style={styles.input}
  placeholder="Write a note..."
  value={text}
  onChangeText={setText}
/>
```

This is a **controlled input**, and it's worth understanding because it's the
state loop in miniature:

- `value={text}` — what's displayed comes *from state*
- `onChangeText={setText}` — every keystroke updates state

So typing updates `text`, which re-renders, which sets `value` to the new text.
The state is the single source of truth; the box just reflects it. That's also
why `setText('')` in `addNote` visibly clears the box.

### The button

```javascript
<TouchableOpacity onPress={addNote}>
  <Text>Add</Text>
</TouchableOpacity>
```

`TouchableOpacity` provides the tap behaviour but draws nothing itself — the
visible label is the `Text` inside it. Note `onPress={addNote}`, **not**
`onPress={addNote()}`. Without parentheses you pass the function for React to
call on tap; with them you'd call it immediately during render.

### The list

```javascript
<FlatList
  data={notes}
  keyExtractor={(item) => item.id}
  ListEmptyComponent={<Text style={styles.empty}>No notes yet. Add one above!</Text>}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.note} onLongPress={() => deleteNote(item.id)}>
      <Text style={styles.noteText}>{item.content}</Text>
    </TouchableOpacity>
  )}
/>
```

| Prop | Job |
|---|---|
| `data` | the array to display |
| `keyExtractor` | pulls a unique key from each item so React can track rows |
| `ListEmptyComponent` | shown instead of rows when the array is empty |
| `renderItem` | a template run once per item — "draw each note like this" |

`renderItem` receives an object and `{ item }` pulls out just the `item`
property — that's destructuring, the same syntax as `const [a, b] = ...` but for
objects.

`onLongPress={() => deleteNote(item.id)}` needs the arrow function wrapper
because the id has to be passed in. Writing `onLongPress={deleteNote(item.id)}`
would run it during render and delete everything immediately.

---

## 6. Styles

```javascript
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60, ... },
  ...
});
```

Pure appearance — nothing here changes behaviour. This is the safest place to
experiment.

Worth knowing:

- **`flex: 1`** means "take up all available space." On `container` it fills the
  screen; on `input` it makes the text box expand so the Add button gets only
  the room it needs.
- **`flexDirection: 'row'`** on `inputRow` lays children out side by side.
  Default in React Native is `column` (stacked vertically) — the opposite of web
  CSS, a frequent source of confusion.
- Numbers need no units — `padding: 15` just means 15 density-independent pixels.
- Names like `container` and `addButton` are arbitrary labels, matched up by
  `style={styles.addButton}` in the return block.

**Try changing `'#4a6cf7'` to `'red'`** and save. Instant feedback, zero risk.

---

## Where to add things next

| To add… | Touch… |
|---|---|
| A new piece of data | a new `useState` near the top |
| A new on-screen element | the return block, plus a style entry |
| A new behaviour | a new function alongside `addNote` / `deleteNote` |
| Anything that changes notes | just call `setNotes` — saving happens automatically |
| Appearance only | the `StyleSheet` at the bottom |

### A way to study that actually works

Before you save a change, **predict what will happen**. Then save and see if you
were right. Being wrong is the useful part — it points exactly at the thing you
misunderstood. Change a colour, move a component to a different position, delete
a line on purpose. It's all recoverable: the code is in Git.

---

## Concepts here worth knowing by name

Everything above is built from a handful of ideas. Knowing their names makes
documentation searchable:

- **State** — watched data that triggers redraws (`useState`)
- **Effects** — code that runs at specific moments (`useEffect`) and the
  dependency array that controls when
- **Props** — values passed into a component, like `style` or `onPress`
- **JSX** — the markup syntax, and `{ }` to drop back into JavaScript
- **Immutability** — always build new arrays/objects rather than modifying
  existing ones
- **async / await** — handling operations that take time
- **Destructuring** — `const [a, b] = ...` and `({ item })`
- **Spread operator** — `...` to unpack an array or object
- **Controlled inputs** — form values driven by state

The natural next concepts, roughly in order: splitting one file into multiple
**components**, then **navigation** between screens, then a remote database and
**authentication**.