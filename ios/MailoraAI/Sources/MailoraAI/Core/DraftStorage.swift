import Foundation

/// Local emergency backup storage for drafts when sessions expire or app terminates
public final class DraftStorage: @unchecked Sendable {
    public static let shared = DraftStorage()
    
    private let draftKey = "mailora_cached_draft_v1"
    private let defaults = UserDefaults.standard

    private init() {}

    public func saveDraft(prompt: String, ctaUrl: String, response: CampaignResponse?) {
        var dict: [String: Any] = [
            "prompt": prompt,
            "ctaUrl": ctaUrl,
            "timestamp": Date().timeIntervalSince1970
        ]
        if let response = response, let data = try? JSONEncoder().encode(response) {
            dict["responseData"] = data
        }
        defaults.set(dict, forKey: draftKey)
    }

    public func retrieveDraft() -> (prompt: String, ctaUrl: String, response: CampaignResponse?)? {
        guard let dict = defaults.dictionary(forKey: draftKey),
              let prompt = dict["prompt"] as? String else {
            return nil
        }
        let ctaUrl = dict["ctaUrl"] as? String ?? ""
        var response: CampaignResponse?
        if let data = dict["responseData"] as? Data {
            response = try? JSONDecoder().decode(CampaignResponse.self, from: data)
        }
        return (prompt, ctaUrl, response)
    }

    public func clearDraft() {
        defaults.removeObject(forKey: draftKey)
    }
}
