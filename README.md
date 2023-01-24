# Ochizu-sama

This map shows the separation of settlements according to the density of Shinto and Buddhist concentrations in Japan.
Shrines and other Shinto sites that are densely populated are colored dark green. Similarly, Buddhist areas such as temples are colored dark brown.

This map was created by obtaining the node corresponding to religion="shinto" or "buddhist" in OpenStreetMap via Overpass, calculating the density of each point from the inverse of the distance value for each location in Japan (each location is divided into a grid of equal intervals), and color-coding the results accordingly.
