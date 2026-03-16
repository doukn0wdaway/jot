package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type ConfigService struct{}

func (c *ConfigService) dir() (string, error) {
	base, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(base, "jot"), nil
}

func (c *ConfigService) readJSON(filename string, v any) error {
	dir, err := c.dir()
	if err != nil {
		return err
	}
	data, err := os.ReadFile(filepath.Join(dir, filename))
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

func (c *ConfigService) writeJSON(filename string, v any) error {
	dir, err := c.dir()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, filename), data, 0644)
}
