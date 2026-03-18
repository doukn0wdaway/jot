package note

import (
	"fmt"
	"jot/internal/settings"
	"os"
	"path/filepath"
	"time"
)

type NoteService struct {
	currentNotePath string
	settings        *settings.SettingsService
}

func NewNoteService(settings *settings.SettingsService) *NoteService {
	return &NoteService{currentNotePath: "", settings: settings}
}

func (n *NoteService) SaveNote(content string) error {
	inboxPath := n.settings.InboxPath()

	if err := os.MkdirAll(inboxPath, 0755); err != nil {
		return err
	}

	if n.currentNotePath == "" {
		t := time.Now()
		filename := fmt.Sprintf("%d-%02d-%02d-%02d%02d%02d.md",
			t.Year(), t.Month(), t.Day(),
			t.Hour(), t.Minute(), t.Second())
		n.currentNotePath = filepath.Join(inboxPath, filename)
	}

	return os.WriteFile(n.currentNotePath, []byte(content+"\n"), 0644)
}

func (n *NoteService) ResetCurrNotePath() {
	n.currentNotePath = ""
}
