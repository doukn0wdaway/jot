package settings

import (
	"jot/internal/app_fs"
	"os"
	"path/filepath"
)

type Settings struct {
	//TODO: ADD Support for obsidian vault
	// хочу чтобы сканились теги из VaultPath и из InboxPath,
	// логика такая: обе папки проверять, инбокс не всегда может быть обсидиан волтом

	// IsObsidian bool   `json:"isObsidian"`
	// VaultPath  string `json:"vaultPath"`
	InboxPath string `json:"inboxPath"`
}

type SettingsService struct {
	appFs *app_fs.AppFs
}

func NewSettingsService(appFs *app_fs.AppFs) *SettingsService {
	return &SettingsService{appFs}
}

func defaultSettings() Settings {
	home, _ := os.UserHomeDir()
	return Settings{
		InboxPath: filepath.Join(home, ".jot"),
	}
}

func (s *SettingsService) Get() Settings {
	defaults := defaultSettings()
	settings := defaults
	if err := s.appFs.ReadJSON(s.appFs.ConfigDirPath("settings.json"), &settings); err != nil {
		s.Save(defaults)
		return defaults
	}
	return settings
}

func (s *SettingsService) Save(settings Settings) error {
	return s.appFs.WriteJSON(s.appFs.ConfigDirPath("settings.json"), settings)
}

func (s *SettingsService) InboxPath() string {
	return s.Get().InboxPath
}
