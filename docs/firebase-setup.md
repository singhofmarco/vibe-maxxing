# Firebase setup for vibe-maxxing

You need to configure **Firestore** in the [Firebase Console](https://console.firebase.google.com) for actions and agenda to work.

## 1. Firestore Security Rules

In **Firebase Console → Firestore Database → Rules**, use rules that allow signed-in users to read/write only their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write only documents where userId == their uid
    match /actions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /agenda/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /sessions/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

Click **Publish**.

## 2. Composite indexes

Some queries need composite indexes. You can either:

- **Let Firebase prompt you**: Run the app and open the Dashboard and Actions pages. If an index is missing, the browser console (or the Firebase Console → Firestore → Indexes) will show an error with a **“Create index”** link—click it to add the index.
- **Create them manually**: In **Firestore → Indexes → Composite**, add:

| Collection | Fields indexed (in order) |
|------------|----------------------------|
| `actions`  | `userId` (Ascending), `timestamp` (Descending) |
| `agenda`   | `userId` (Ascending), `date` (Ascending)      |

After indexes are created (often 1–2 minutes), the queries will run without errors.

## 3. Collections (no manual step)

The app creates the **`actions`** and **`agenda`** collections when it first writes data (e.g. after a voice session that creates actions or agenda items). You don’t need to create them by hand.
