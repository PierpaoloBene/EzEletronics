# Project Estimation - FUTURE
Date:
03/05/2024

Version:


# Estimation approach
Consider the EZElectronics  project in FUTURE version (as proposed by your team in requirements V2), assume that you are going to develop the project INDEPENDENT of the deadlines of the course, and from scratch (not from V1)
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | ------------------------------- |  
| NC =  Estimated number of classes to be developed   |       41                  |             
|  A = Estimated average size per class, in LOC       |    150 LOC                    | 
| S = Estimated size of project, in LOC (= NC * A) | 6150 LOC |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |        615 PH                 |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 18450€| 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |     3,84            |               

# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
|requirement document    | 65 PH |
| GUI prototype | 18 PH |
|design document | 20 PH |
|code | 135 PH |
| unit tests | 169 PH |
| api tests | 34 PH |
| management documents  | 7 PH |



# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | ------------------------------- | 
| **Pianificazione requisiti** | |
| Stima del rischio | 20 PH|
| Studio dei sistemi già esistenti | 40 PH |
| Identificare requisiti funzionali e non funzionali| 24 PH |
| **Design del sistema** | |
| Design delle classi | 60 PH |
| Deployment diagram | 2 PH|
| GUI | 18 PH |
| **Sviluppo** | |
| Sviluppo classi | 83 PH |
| Sviluppo metodi database | 10 PH |
| Sviluppo API | 16 PH |
| Revisione ed aggiornamento documentazione | 16 PH |
|**Testing** ||
| Unit tests | 195 PH|
| API tests | 32 PH |
| Test requisiti non funzionali | 120 PH |
|**Deployment**||
| Distribuzione del software | 12 PH |
###
![Gantt_v2](/assets/Gantt_v2.jpg)

# Summary

Report here the results of the three estimation approaches. The estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | ------------------------------- | ---------------|
| estimate by size | 615 PH | 3,84 settimane
| estimate by product decomposition | 448 PH | 2,8 settimane
| estimate by activity decomposition | 648 PH | 4 settimane |


Le stime ottenute con il metodo by size non tengono conto delle ore investite sulla parte di design dei requisiti, ma esso è più dettagliato per quanto riguarda la stima della quantità di codice scritto. Complessivamente, in questo caso l’effort ottenuto dal metodo by size risulta maggiore rispetto a quello basato su product decomposition poiché l'implementazione di funzionalità extra rispetto alla V1 impatta sulla stima delle LOC.
Le stime ottenute con il metodo by product decomposition sono inferiori a quelle ottenute con il metodo by activity perché gli obiettivi del metodo by product sono finalizzati all’ottenimento di un prodotto, mentre il metodo activity decomposition è più dettagliato per quanto riguarda lo scheduling delle attività e, inoltre, tiene conto della fase di rilascio del software, successiva allo sviluppo.