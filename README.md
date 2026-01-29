# Linz AG Monitor Card (Multi-Version)

Eine Custom Card für Home Assistant, um Abfahrtszeiten der Linz AG (V1, V2, V3) anzuzeigen.

![Linz AG Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Zeichen_224_-_Haltestelle%2C_StVO_2017.svg/100px-Zeichen_224_-_Haltestelle%2C_StVO_2017.svg.png)

## Installation

### HACS (Empfohlen)
1. Gehe zu HACS -> **Frontend**.
2. Klicke auf die drei Punkte oben rechts und wähle **Benutzerdefinierte Repositories**.
3. Füge die URL `https://github.com/irmscher123/linz-linien-card` hinzu und wähle Kategorie **Lovelace**.
4. Klicke auf "Herunterladen".

## Konfiguration

Füge die Karte über den UI-Editor hinzu oder verwende YAML:

```yaml
type: 'custom:linz-monitor-card'
version: 'v1' # Wähle 'v1', 'v2' oder 'v3'
v1:
  entity: sensor.linz_ag_monitor
  anzahl: 7
