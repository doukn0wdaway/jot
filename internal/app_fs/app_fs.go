package app_fs

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type AppFs struct {
	configDir string
}

func NewAppFs() (*AppFs, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}
	return &AppFs{configDir: filepath.Join(base, "jot")}, nil
}

func (f *AppFs) ConfigDirPath(filename string) string {
	return filepath.Join(f.configDir, filename)
}

func (f *AppFs) ReadJSON(path string, v any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	return json.Unmarshal(data, v)
}

func (f *AppFs) WriteJSON(path string, v any) error {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}
