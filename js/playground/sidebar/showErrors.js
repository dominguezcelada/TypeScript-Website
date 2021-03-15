define(["require", "exports", "../localizeWithFallback"], function (require, exports, localizeWithFallback_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showErrors = void 0;
    const showErrors = (i, utils) => {
        let container;
        let sandbox;
        let ds;
        let prevMarkers = [];
        const updateUI = () => {
            if (!sandbox)
                return;
            const model = sandbox.getModel();
            const markers = sandbox.monaco.editor.getModelMarkers({ resource: model.uri });
            // @ts-ignore
            const playground = window.playground;
            if (!playground)
                return;
            if (playground.getCurrentPlugin().id !== "errors")
                return;
            ds.clearDeltaDecorators(true);
            // Bail early if there's nothing to show
            if (!markers.length) {
                ds.showEmptyScreen(localizeWithFallback_1.localize("play_sidebar_errors_no_errors", "No errors"));
                return;
            }
            // The hover can trigger this, so avoid that loop
            const markerIDs = markers.filter(m => m.severity !== 1).map(m => m.startColumn + m.startLineNumber);
            if (JSON.stringify(markerIDs) === JSON.stringify(prevMarkers))
                return;
            prevMarkers = markerIDs;
            // Clean any potential empty screens
            ds.clear();
            ds.subtitle("Errors in code");
            ds.listDiags(model, markersToTSDiags(model, markers));
        };
        let changeDecoratorsDispose;
        const plugin = {
            id: "errors",
            displayName: i("play_sidebar_errors"),
            didMount: (_sandbox, _container) => {
                sandbox = _sandbox;
                container = _container;
                ds = utils.createDesignSystem(container);
                changeDecoratorsDispose = sandbox.getModel().onDidChangeDecorations(updateUI);
                prevMarkers = [{}];
                updateUI();
            },
            didUnmount: () => {
                if (changeDecoratorsDispose)
                    changeDecoratorsDispose.dispose();
                if (ds)
                    ds.clearDeltaDecorators(true);
            },
        };
        return plugin;
    };
    exports.showErrors = showErrors;
    const markersToTSDiags = (model, markers) => {
        return markers
            .map(m => {
            const start = model.getOffsetAt({ column: m.startColumn, lineNumber: m.startLineNumber });
            return {
                code: -1,
                category: markerToDiagSeverity(m.severity),
                file: undefined,
                start,
                length: model.getCharacterCountInRange(m),
                messageText: m.message,
            };
        })
            .sort((lhs, rhs) => lhs.category - rhs.category);
    };
    /*
    export enum MarkerSeverity {
        Hint = 1,
        Info = 2,
        Warning = 4,
        Error = 8
    }
    
    to
    
    export enum DiagnosticCategory {
        Warning = 0,
        Error = 1,
        Suggestion = 2,
        Message = 3
    }
      */
    const markerToDiagSeverity = (markerSev) => {
        switch (markerSev) {
            case 1:
                return 2;
            case 2:
                return 3;
            case 4:
                return 0;
            case 8:
                return 1;
            default:
                return 3;
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvd0Vycm9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BsYXlncm91bmQvc3JjL3NpZGViYXIvc2hvd0Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBS08sTUFBTSxVQUFVLEdBQWtCLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ3BELElBQUksU0FBc0IsQ0FBQTtRQUMxQixJQUFJLE9BQWdCLENBQUE7UUFDcEIsSUFBSSxFQUErQyxDQUFBO1FBQ25ELElBQUksV0FBVyxHQUFVLEVBQUUsQ0FBQTtRQUUzQixNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7WUFDcEIsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTTtZQUNwQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDaEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO1lBRTlFLGFBQWE7WUFDYixNQUFNLFVBQVUsR0FBZSxNQUFNLENBQUMsVUFBVSxDQUFBO1lBRWhELElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU07WUFDdkIsSUFBSSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEtBQUssUUFBUTtnQkFBRSxPQUFNO1lBRXpELEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUU3Qix3Q0FBd0M7WUFDeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLEVBQUUsQ0FBQyxlQUFlLENBQUMsK0JBQVEsQ0FBQywrQkFBK0IsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFBO2dCQUMxRSxPQUFNO2FBQ1A7WUFFRCxpREFBaUQ7WUFDakQsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFB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QUMsQ0FBQTtZQUNWO2dCQUNFLE9BQU8sQ0FBQyxDQUFBO1NBQ1g7SUFDSCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IElEaXNwb3NhYmxlIH0gZnJvbSBcIm1vbmFjby1lZGl0b3JcIlxuaW1wb3J0IHR5cGUgeyBTYW5kYm94IH0gZnJvbSBcInR5cGVzY3JpcHRsYW5nLW9yZy9zdGF0aWMvanMvc2FuZGJveFwiXG5pbXBvcnQgeyBQbGF5Z3JvdW5kUGx1Z2luLCBQbHVnaW5GYWN0b3J5LCBQbGF5Z3JvdW5kIH0gZnJvbSBcIi4uXCJcbmltcG9ydCB7IGxvY2FsaXplIH0gZnJvbSBcIi4uL2xvY2FsaXplV2l0aEZhbGxiYWNrXCJcblxuZXhwb3J0IGNvbnN0IHNob3dFcnJvcnM6IFBsdWdpbkZhY3RvcnkgPSAoaSwgdXRpbHMpID0+IHtcbiAgbGV0IGNvbnRhaW5lcjogSFRNTEVsZW1lbnRcbiAgbGV0IHNhbmRib3g6IFNhbmRib3hcbiAgbGV0IGRzOiBSZXR1cm5UeXBlPHR5cGVvZiB1dGlscy5jcmVhdGVEZXNpZ25TeXN0ZW0+XG4gIGxldCBwcmV2TWFya2VyczogYW55W10gPSBbXVxuXG4gIGNvbnN0IHVwZGF0ZVVJID0gKCkgPT4ge1xuICAgIGlmICghc2FuZGJveCkgcmV0dXJuXG4gICAgY29uc3QgbW9kZWwgPSBzYW5kYm94LmdldE1vZGVsKClcbiAgICBjb25zdCBtYXJrZXJzID0gc2FuZGJveC5tb25hY28uZWRpdG9yLmdldE1vZGVsTWFya2Vycyh7IHJlc291cmNlOiBtb2RlbC51cmkgfSlcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBwbGF5Z3JvdW5kOiBQbGF5Z3JvdW5kID0gd2luZG93LnBsYXlncm91bmRcblxuICAgIGlmICghcGxheWdyb3VuZCkgcmV0dXJuXG4gICAgaWYgKHBsYXlncm91bmQuZ2V0Q3VycmVudFBsdWdpbigpLmlkICE9PSBcImVycm9yc1wiKSByZXR1cm5cblxuICAgIGRzLmNsZWFyRGVsdGFEZWNvcmF0b3JzKHRydWUpXG5cbiAgICAvLyBCYWlsIGVhcmx5IGlmIHRoZXJlJ3Mgbm90aGluZyB0byBzaG93XG4gICAgaWYgKCFtYXJrZXJzLmxlbmd0aCkge1xuICAgICAgZHMuc2hvd0VtcHR5U2NyZWVuKGxvY2FsaXplKFwicGxheV9zaWRlYmFyX2Vycm9yc19ub19lcnJvcnNcIiwgXCJObyBlcnJvcnNcIikpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUaGUgaG92ZXIgY2FuIHRyaWdnZXIgdGhpcywgc28gYXZvaWQgdGhhdCBsb29wXG4gICAgY29uc3QgbWFya2VySURzID0gbWFya2Vycy5maWx0ZXIobSA9PiBtLnNldmVyaXR5ICE9PSAxKS5tYXAobSA9PiBtLnN0YXJ0Q29sdW1uICsgbS5zdGFydExpbmVOdW1iZXIpXG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KG1hcmtlcklEcykgPT09IEpTT04uc3RyaW5naWZ5KHByZXZNYXJrZXJzKSkgcmV0dXJuXG4gICAgcHJldk1hcmtlcnMgPSBtYXJrZXJJRHNcblxuICAgIC8vIENsZWFuIGFueSBwb3RlbnRpYWwgZW1wdHkgc2NyZWVuc1xuICAgIGRzLmNsZWFyKClcbiAgICBkcy5zdWJ0aXRsZShcIkVycm9ycyBpbiBjb2RlXCIpXG4gICAgZHMubGlzdERpYWdzKG1vZGVsLCBtYXJrZXJzVG9UU0RpYWdzKG1vZGVsLCBtYXJrZXJzKSlcbiAgfVxuXG4gIGxldCBjaGFuZ2VEZWNvcmF0b3JzRGlzcG9zZTogSURpc3Bvc2FibGUgfCB1bmRlZmluZWRcblxuICBjb25zdCBwbHVnaW46IFBsYXlncm91bmRQbHVnaW4gPSB7XG4gICAgaWQ6IFwiZXJyb3JzXCIsXG4gICAgZGlzcGxheU5hbWU6IGkoXCJwbGF5X3NpZGViYXJfZXJyb3JzXCIpLFxuICAgIGRpZE1vdW50OiAoX3NhbmRib3gsIF9jb250YWluZXIpID0+IHtcbiAgICAgIHNhbmRib3ggPSBfc2FuZGJveFxuICAgICAgY29udGFpbmVyID0gX2NvbnRhaW5lclxuICAgICAgZHMgPSB1dGlscy5jcmVhdGVEZXNpZ25TeXN0ZW0oY29udGFpbmVyKVxuICAgICAgY2hhbmdlRGVjb3JhdG9yc0Rpc3Bvc2UgPSBzYW5kYm94LmdldE1vZGVsKCkub25EaWRDaGFuZ2VEZWNvcmF0aW9ucyh1cGRhdGVVSSlcbiAgICAgIHByZXZNYXJrZXJzID0gW3t9XVxuICAgICAgdXBkYXRlVUkoKVxuICAgIH0sXG4gICAgZGlkVW5tb3VudDogKCkgPT4ge1xuICAgICAgaWYgKGNoYW5nZURlY29yYXRvcnNEaXNwb3NlKSBjaGFuZ2VEZWNvcmF0b3JzRGlzcG9zZS5kaXNwb3NlKClcbiAgICAgIGlmIChkcykgZHMuY2xlYXJEZWx0YURlY29yYXRvcnModHJ1ZSlcbiAgICB9LFxuICB9XG4gIHJldHVybiBwbHVnaW5cbn1cblxuY29uc3QgbWFya2Vyc1RvVFNEaWFncyA9IChcbiAgbW9kZWw6IGltcG9ydChcIm1vbmFjby1lZGl0b3JcIikuZWRpdG9yLklNb2RlbCxcbiAgbWFya2VyczogaW1wb3J0KFwibW9uYWNvLWVkaXRvclwiKS5lZGl0b3IuSU1hcmtlcltdXG4pOiBpbXBvcnQoXCJ0eXBlc2NyaXB0XCIpLkRpYWdub3N0aWNSZWxhdGVkSW5mb3JtYXRpb25bXSA9PiB7XG4gIHJldHVybiBtYXJrZXJzXG4gICAgLm1hcChtID0+IHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gbW9kZWwuZ2V0T2Zmc2V0QXQoeyBjb2x1bW46IG0uc3RhcnRDb2x1bW4sIGxpbmVOdW1iZXI6IG0uc3RhcnRMaW5lTnVtYmVyIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgY2F0ZWdvcnk6IG1hcmtlclRvRGlhZ1NldmVyaXR5KG0uc2V2ZXJpdHkpLFxuICAgICAgICBmaWxlOiB1bmRlZmluZWQsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBsZW5ndGg6IG1vZGVsLmdldENoYXJhY3RlckNvdW50SW5SYW5nZShtKSxcbiAgICAgICAgbWVzc2FnZVRleHQ6IG0ubWVzc2FnZSxcbiAgICAgIH1cbiAgICB9KVxuICAgIC5zb3J0KChsaHMsIHJocykgPT4gbGhzLmNhdGVnb3J5IC0gcmhzLmNhdGVnb3J5KVxufVxuXG4vKlxuZXhwb3J0IGVudW0gTWFya2VyU2V2ZXJpdHkge1xuICAgIEhpbnQgPSAxLFxuICAgIEluZm8gPSAyLFxuICAgIFdhcm5pbmcgPSA0LFxuICAgIEVycm9yID0gOFxufVxuXG50byBcblxuZXhwb3J0IGVudW0gRGlhZ25vc3RpY0NhdGVnb3J5IHtcbiAgICBXYXJuaW5nID0gMCxcbiAgICBFcnJvciA9IDEsXG4gICAgU3VnZ2VzdGlvbiA9IDIsXG4gICAgTWVzc2FnZSA9IDNcbn1cbiAgKi9cbmNvbnN0IG1hcmtlclRvRGlhZ1NldmVyaXR5ID0gKG1hcmtlclNldjogbnVtYmVyKSA9PiB7XG4gIHN3aXRjaCAobWFya2VyU2V2KSB7XG4gICAgY2FzZSAxOlxuICAgICAgcmV0dXJuIDJcbiAgICBjYXNlIDI6XG4gICAgICByZXR1cm4gM1xuICAgIGNhc2UgNDpcbiAgICAgIHJldHVybiAwXG4gICAgY2FzZSA4OlxuICAgICAgcmV0dXJuIDFcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIDNcbiAgfVxufVxuIl19