import { useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import { useStore } from '@/store';

/**
 * Empty-state screen (MVP §7 screen 1). Shown only when no Character
 * exists; if one does (returning user), we silently redirect straight to
 * their CharacterSheet.
 */
export function Welcome(): ReactElement {
  const navigate = useNavigate();
  const characterId = useStore(
    useShallow((s) => (s.appState ? (s.appState.characters[0]?.id ?? null) : null)),
  );

  useEffect(() => {
    if (characterId !== null) {
      void navigate(`/character/${characterId}`, { replace: true });
    }
  }, [characterId, navigate]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Welcome, adventurer.</h1>
      <p className="text-muted-foreground">
        This is your private inventory manager for D&amp;D 5e (2024). Start by creating your
        character.
      </p>
      <Button
        size="lg"
        onClick={() => {
          void navigate('/create-character');
        }}
      >
        <UserPlus className="h-4 w-4" />
        Create your character
      </Button>
    </div>
  );
}
