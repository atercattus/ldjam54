package main

import (
	"flag"
	"path"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var (
	args struct {
		help bool

		listenAddr string

		fsRoot    string
		urlPrefix string
	}
)

func init() {
	flag.BoolVar(&args.help, "help", false, "show this help")

	flag.StringVar(&args.listenAddr, "addr", ":8000", "address to listen")

	flag.StringVar(&args.fsRoot, "path", "", "path to static directory")
	flag.StringVar(&args.urlPrefix, "prefix", "", "url prefix")
}

func main() {
	flag.Parse()
	if args.help {
		flag.Usage()
		return
	}

	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			ext := strings.ToLower(path.Ext(c.Request().URL.Path))
			switch ext {
			case ".png":
				return true
			default:
				return false
			}
		},
	}))

	e.Static(args.urlPrefix, args.fsRoot)

	e.Logger.Fatal(e.Start(args.listenAddr))
}
