package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type NoteService struct {
	config          *ConfigService
	settings        *SettingsService
	currentNotePath string
}

func (n *NoteService) SaveNote(content string) error {
	inboxPath := n.settings.GetSettings().InboxPath

	if err := os.MkdirAll(inboxPath, 0755); err != nil {
		return err
	}

	if n.currentNotePath == "" {
		t := time.Now()
		filename := fmt.Sprintf("%d-%02d-%s-%02d%02d%02d.md",
			t.Year(), t.Day(), strings.ToUpper(t.Format("Jan")),
			t.Hour(), t.Minute(), t.Second())
		n.currentNotePath = filepath.Join(inboxPath, filename)
	}

	return os.WriteFile(n.currentNotePath, []byte(content+"\n"), 0644)
}

func (n *NoteService) ResetCurrNotePath() {
	n.currentNotePath = ""
}
