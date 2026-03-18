package tags

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"jot/internal/app_fs"
	"jot/internal/settings"

	"github.com/wailsapp/wails/v3/pkg/application"
)

var tagRegex = regexp.MustCompile(`#(\w+)`)

type TagsService struct {
	appFs           *app_fs.AppFs
	settingsService *settings.SettingsService
}

func NewTagsService(appFs *app_fs.AppFs, settingsService *settings.SettingsService) *TagsService {
	return &TagsService{appFs, settingsService}
}

func (t *TagsService) GetTags() []string {
	var tags []string
	if err := t.appFs.ReadJSON(t.appFs.ConfigDirPath("tags.json"), &tags); err != nil {
		return nil
	}
	return tags
}

func (t *TagsService) ScanTags() {
	go func() {
		inboxPath := t.settingsService.InboxPath()

		entries, err := os.ReadDir(inboxPath)
		if err != nil {
			return
		}

		tagSet := make(map[string]struct{})
		for _, entry := range entries {
			if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".md") {
				continue
			}
			data, err := os.ReadFile(filepath.Join(inboxPath, entry.Name()))
			if err != nil {
				continue
			}
			for _, m := range tagRegex.FindAllStringSubmatch(string(data), -1) {
				tagSet[m[1]] = struct{}{}
			}
		}

		tags := make([]string, 0, len(tagSet))
		for tag := range tagSet {
			tags = append(tags, tag)
		}
		sort.Strings(tags)

		t.appFs.WriteJSON(t.appFs.ConfigDirPath("tags.json"), tags)
		application.Get().Event.Emit("tags-ready", tags)
	}()
}
