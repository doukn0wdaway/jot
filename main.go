package main

import (
	"embed"
	_ "embed"
	"jot/internal/app_fs"
	"jot/internal/note"
	"jot/internal/settings"
	"jot/internal/tags"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	application.RegisterEvent[[]string]("tags-ready")
}

func main() {
	appFs, err := app_fs.NewAppFs()
	if err != nil {
		panic(err)
	}

	settingsSvc := settings.NewSettingsService(appFs)
	tagsSvc := tags.NewTagsService(appFs, settingsSvc)
	noteSvc := note.NewNoteService(settingsSvc)

	app := application.New(application.Options{
		Name:        "Jot",
		Description: "tool for fast notes",
		Services: []application.Service{
			application.NewService(settingsSvc),
			application.NewService(tagsSvc),
			application.NewService(noteSvc),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		SingleInstance: &application.SingleInstanceOptions{
			UniqueID: "com.doukn0wdaway.jot",
			OnSecondInstanceLaunch: func(data application.SecondInstanceData) {
				app := application.Get()
				window, isExists := app.Window.GetByName("jot-main")
				if isExists {
					window.Show()
					tagsSvc.ScanTags()
					window.Focus()
				}
			},
		},
	})

	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Name:        "jot-main",
		Title:       "Jot",
		Width:       600,
		Height:      400,
		MinWidth:    600,
		MinHeight:   400,
		URL:         "/",
		Frameless:   false,
		AlwaysOnTop: false,
		Hidden:      true,
	})

	window.RegisterHook(events.Common.WindowClosing, func(e *application.WindowEvent) {
		e.Cancel()
		window.Hide()
	})

	systray := app.SystemTray.New()
	systray.SetLabel("Jot")

	menu := app.NewMenu()
	menu.Add("Show").OnClick(func(ctx *application.Context) {
		window.Show()
		tagsSvc.ScanTags()
	})
	menu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})

	systray.SetMenu(menu)

	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
