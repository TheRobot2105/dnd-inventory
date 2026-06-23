import { createBrowserRouter, Navigate } from 'react-router-dom';

import { RootLayout } from '@/components/Layout';
import { Welcome } from '@/screens/Welcome';
import { CreateCharacter } from '@/screens/CreateCharacter';
import { CharacterSheet } from '@/screens/CharacterSheet';
import { Settings } from '@/screens/Settings';

/**
 * Data router (TECH_STACK §2.6). Routes mirror the MVP screen list (§7):
 *   /                    — Welcome (or redirect to the existing character)
 *   /create-character    — CreateCharacterForm
 *   /character/:id       — CharacterSheet with tab subroutes
 *   /settings            — Settings
 *
 * Future MVP screens nest under existing routes:
 *   /storage/:stashId    — StorageDetail (M3)
 *   /item/:instanceId    — ItemDetail (M2)
 *   /catalog             — CatalogBrowser (M2)
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Welcome },
      { path: 'create-character', Component: CreateCharacter },
      { path: 'character/:id', Component: CharacterSheet },
      { path: 'settings', Component: Settings },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
