package main

import (
	"os"
	"path/filepath"
)

type Settings struct {
	IsObsidian bool   `json:"isObsidian"`
	VaultPath  string `json:"vaultPath"`
	InboxPath  string `json:"inboxPath"`
}

func defaultSettings() Settings {
	home, _ := os.UserHomeDir()
	return Settings{
		InboxPath: filepath.Join(home, ".jot"),
	}
}

type SettingsService struct {
	config *ConfigService
}

func (s *SettingsService) GetSettings() Settings {
	defaults := defaultSettings()
	settings := defaults
	if err := s.config.readJSON("settings.json", &settings); err != nil {
		return defaults
	}
	return settings
}

func (s *SettingsService) SaveSettings(settings Settings) error {
	return s.config.writeJSON("settings.json", settings)
}
