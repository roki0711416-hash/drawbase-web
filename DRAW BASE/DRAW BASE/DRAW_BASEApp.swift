//
//  DRAW_BASEApp.swift
//  DRAW BASE
//
//  Created by 清水裕基 on 2026/03/06.
//

import SwiftUI

@main
struct DRAW_BASEApp: App {
    @State private var authManager = AuthManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authManager)
        }
    }
}
