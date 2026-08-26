// Hand-authored (no Google Sheet tab yet). Follows the same shape as the sync script's output —
// see docs/add-new-guide-tool.md. Replace with a synced file once the Sheet tab exists.
import type { GuideContentByLocale } from "../types";

const content: GuideContentByLocale = {
  "en": {
    "name": "Before & After Photo Maker",
    "meta": {
      "title": "Free Before & After Photo Maker | Slider, GIF & Side by Side",
      "description": "Turn two photos into a before and after: drag slider, side by side, split, or stacked. Line the shots up, add a caption, export a PNG or looping GIF. Free, no watermark.",
      "ogTitle": "",
      "ogDescription": ""
    },
    "hero": {
      "headline": "Before & After Photo Maker",
      "subheadline": "Upload two photos and show the change four ways — a draggable slider, side by side, split, or stacked. Line the shots up, add a caption, and export a PNG or a looping GIF.",
      "image": null,
      "cta": {
        "text": "Compare Two Photos",
        "href": null
      },
      "formats": []
    },
    "toolLinks": {
      "lead": "",
      "items": [
        {
          "id": "1",
          "label": "Photo Quote Maker",
          "href": "/photo-quote-maker"
        },
        {
          "id": "2",
          "label": "Photo Overlay Editor",
          "href": "/photo-overlay-editor"
        },
        {
          "id": "3",
          "label": "Polka Dot Generator",
          "href": "/polka-dot"
        }
      ]
    },
    "features": [
      {
        "id": "1",
        "heading": "Four Layouts From One Pair of Photos",
        "body": "The same two photos can be a draggable slider, a side-by-side pair, a split frame with a hairline divider, or one stacked above the other. Switch between them as often as you like — nothing is re-uploaded and nothing is lost, so you can see which one actually tells the story before you commit.",
        "image": null,
        "cta": null
      },
      {
        "id": "2",
        "heading": "Export a Looping GIF, Not Just a Still",
        "body": "On the slider layout, one button sweeps the divider all the way across and back and encodes it as a looping GIF. The comparison plays itself, which is what you want in a feed or a chat where nobody is going to drag anything. Encoding happens on your device — no upload, no queue.",
        "image": null,
        "cta": null
      },
      {
        "id": "3",
        "heading": "Line Up Shots That Don't Quite Match",
        "body": "Two photos taken weeks apart are rarely framed identically. Align mode lays the after photo over the before at half opacity so you can drag, scale, and rotate it into place until the fixed points — a doorframe, a shoulder, a horizon — actually line up. The nudge carries through to every layout and to the export.",
        "image": null,
        "cta": null
      },
      {
        "id": "4",
        "heading": "Put a Caption Anywhere on the Frame",
        "body": "Add a short caption and drag it wherever it sits best — over the before side, along the bottom, off in a corner. Size and color are yours to set, and long text wraps inside the frame instead of running off the edge. Leave it empty and no text is drawn at all.",
        "image": null,
        "cta": null
      },
      {
        "id": "5",
        "heading": "Free Export, No Watermark, Nothing Uploaded",
        "body": "Both photos are decoded and composed in your browser. Nothing reaches a server, nothing is stored afterward, and nothing is stamped onto the result — which matters most when the comparison involves a client, a patient, or your own face. Export as often as you want, without an account.",
        "image": null,
        "cta": null
      }
    ],
    "howTo": {
      "heading": "How to Make a Before & After Photo",
      "steps": [
        {
          "id": "1",
          "heading": "Upload the Before Photo",
          "body": "Choose the earlier photo — the starting point you want to compare against. It stays on your device."
        },
        {
          "id": "2",
          "heading": "Upload the After Photo",
          "body": "Add the later photo. Both are fitted to the same frame automatically; if the framing is off, open Align and nudge the after photo into place."
        },
        {
          "id": "3",
          "heading": "Pick a Layout and Export",
          "body": "Choose slider, side by side, split, or stacked, add a caption if you want one, then download a PNG — or a looping GIF if you stayed on the slider."
        }
      ]
    },
    "why": {
      "heading": "Why Use This Before & After Photo Maker?",
      "cards": [
        {
          "id": "1",
          "heading": "One Drag, Not Two Photos to Compare",
          "body": "The slider does the comparing for the viewer instead of leaving them to flick back and forth between two separate images."
        },
        {
          "id": "2",
          "heading": "A GIF Compares Itself",
          "body": "In a feed or a group chat nobody drags anything. A looping GIF sweeps the divider on its own, so the change lands without any interaction."
        },
        {
          "id": "3",
          "heading": "Alignment Built In",
          "body": "Most comparison tools assume your two photos are framed identically. This one lets you drag, scale, and rotate the after shot until they match."
        },
        {
          "id": "4",
          "heading": "Private by Default",
          "body": "Photos are decoded and composed on your device only — nothing is uploaded to a server, and nothing is kept afterward."
        }
      ]
    },
    "faq": {
      "heading": "FAQs",
      "items": [
        {
          "id": "1",
          "question": "Is this before and after photo maker free?",
          "answer": "Yes. Uploading, comparing, captioning, and exporting are all free, with no watermark and no account required. There is no cap on how many comparisons you make."
        },
        {
          "id": "2",
          "question": "Are my photos safe and private?",
          "answer": "Yes. Both photos are decoded and composed entirely in your browser. They are never uploaded to a server, and nothing is stored once you close the tab."
        },
        {
          "id": "3",
          "question": "What layouts can I choose from?",
          "answer": "Four: a draggable slider, side by side, a split frame with a thin divider, and one photo stacked above the other. You can switch between them at any point without re-uploading."
        },
        {
          "id": "4",
          "question": "Can I export an animated GIF?",
          "answer": "Yes, on the slider layout. The GIF sweeps the divider across the frame and back, then loops. The other three layouts are static arrangements, so they export as PNG."
        },
        {
          "id": "5",
          "question": "Can I control where the slider sits in the exported PNG?",
          "answer": "Yes. Drag the divider to whichever position best shows the change and the PNG captures that exact position. A GIF export sweeps the full range regardless of where you left it."
        },
        {
          "id": "6",
          "question": "What if my two photos aren't framed the same way?",
          "answer": "Open Align. The after photo is laid over the before at half opacity so you can drag, scale, and rotate it until the fixed points match. The adjustment applies to every layout and to what you export."
        },
        {
          "id": "7",
          "question": "Can I add text to the comparison?",
          "answer": "Yes. Add a caption, drag it anywhere on the frame, and set its size and color. Long captions wrap inside the frame rather than running off the edge. Leaving it empty draws no text."
        },
        {
          "id": "8",
          "question": "What image files can I upload?",
          "answer": "PNG, JPG, and WEBP. Exports come out as a full-resolution PNG, or as a GIF sized for feeds and chat apps when you use the GIF button."
        }
      ]
    },
    "finalCta": {
      "heading": "Make Your Before & After",
      "body": "Upload two photos, pick the layout that tells the story, and download a PNG or a looping GIF — no account, no watermark.",
      "cta": {
        "text": "Start Comparing",
        "href": null
      }
    }
  },
  "jp": {
    "name": "ビフォーアフター写真メーカー",
    "meta": {
      "title": "無料ビフォーアフター写真メーカー｜スライダー・GIF・並べて比較",
      "description": "2枚の写真をビフォーアフターに。スライダー・並べて・分割・上下の4レイアウト、位置合わせと文字入れ、PNGとループGIFの書き出しに対応。無料・ウォーターマークなし。",
      "ogTitle": "",
      "ogDescription": ""
    },
    "hero": {
      "headline": "ビフォーアフター写真メーカー",
      "subheadline": "2枚の写真をアップして、変化を4通りで見せる——ドラッグできるスライダー、並べて、分割、上下。位置を合わせ、文字を添えて、PNGかループGIFで書き出せます。",
      "image": null,
      "cta": {
        "text": "2枚の写真を比較する",
        "href": null
      },
      "formats": []
    },
    "toolLinks": {
      "lead": "",
      "items": [
        {
          "id": "1",
          "label": "写真クオートメーカー",
          "href": "/photo-quote-maker"
        },
        {
          "id": "2",
          "label": "写真オーバーレイ編集",
          "href": "/photo-overlay-editor"
        },
        {
          "id": "3",
          "label": "ポルカドットジェネレーター",
          "href": "/polka-dot"
        }
      ]
    },
    "features": [
      {
        "id": "1",
        "heading": "同じ2枚から4つのレイアウト",
        "body": "同じ2枚が、ドラッグできるスライダーにも、並べた2枚にも、細い境界線で区切った分割にも、上下に重ねた形にもなります。何度切り替えても写真を上げ直す必要はなく、設定も消えません。どれが一番伝わるか、決める前に見比べられます。",
        "image": null,
        "cta": null
      },
      {
        "id": "2",
        "heading": "静止画だけでなくループGIFも書き出せる",
        "body": "スライダーのレイアウトなら、ボタンひとつで境界線が端から端まで往復する様子をループGIFに書き出せます。フィードやチャットでは誰もドラッグしてくれません。GIFなら比較が勝手に再生されます。エンコードは端末上で完結し、アップロードも順番待ちもありません。",
        "image": null,
        "cta": null
      },
      {
        "id": "3",
        "heading": "構図がそろっていない2枚も合わせられる",
        "body": "何週間も空けて撮った2枚の構図がぴったり合うことはまずありません。位置合わせモードではアフター写真を半透明でビフォーに重ね、ドア枠・肩・地平線といった動かない目印が重なるまで、ドラッグ・拡大縮小・回転で調整できます。調整はすべてのレイアウトと書き出しに反映されます。",
        "image": null,
        "cta": null
      },
      {
        "id": "4",
        "heading": "文字は画面のどこにでも置ける",
        "body": "短い文字を加えて、一番収まりのいい場所へドラッグするだけ。ビフォー側に重ねても、下端に沿わせても、隅に逃がしても構いません。サイズと色は自由に設定でき、長い文字は画面からはみ出さずに折り返します。空のままなら文字は描画されません。",
        "image": null,
        "cta": null
      },
      {
        "id": "5",
        "heading": "無料・ウォーターマークなし・アップロードなし",
        "body": "2枚ともブラウザ内でデコードして合成します。サーバーには何も送られず、あとに何も残らず、仕上がりに何も刻印されません。クライアントや患者さん、自分の顔が写っている比較ほど、この点が効いてきます。アカウントなしで何度でも書き出せます。",
        "image": null,
        "cta": null
      }
    ],
    "howTo": {
      "heading": "ビフォーアフター写真の作り方",
      "steps": [
        {
          "id": "1",
          "heading": "ビフォー写真をアップロード",
          "body": "先に撮った写真——比較の起点になる1枚を選びます。写真は端末から出ません。"
        },
        {
          "id": "2",
          "heading": "アフター写真をアップロード",
          "body": "あとに撮った写真を追加します。2枚は自動で同じ枠に収まります。構図がずれていれば「位置合わせ」を開いてアフター写真を動かしてください。"
        },
        {
          "id": "3",
          "heading": "レイアウトを選んで書き出す",
          "body": "スライダー・並べて・分割・上下から選び、必要なら文字を添えて、PNGをダウンロード。スライダーのままならループGIFも書き出せます。"
        }
      ]
    },
    "why": {
      "heading": "このビフォーアフター写真メーカーを使う理由",
      "cards": [
        {
          "id": "1",
          "heading": "2枚を見比べさせず、1回のドラッグで伝える",
          "body": "見る人が2枚を行き来する代わりに、スライダーが比較そのものを引き受けます。"
        },
        {
          "id": "2",
          "heading": "GIFなら勝手に比較してくれる",
          "body": "フィードやグループチャットで誰かがドラッグしてくれることはありません。ループGIFは境界線が自動で往復するので、操作なしで変化が伝わります。"
        },
        {
          "id": "3",
          "heading": "位置合わせを標準搭載",
          "body": "多くの比較ツールは2枚の構図が同じである前提です。ここではアフター写真をドラッグ・拡大縮小・回転させて、実際に合わせられます。"
        },
        {
          "id": "4",
          "heading": "初めから非公開",
          "body": "写真は端末の中だけでデコード・合成されます。サーバーへのアップロードはなく、あとに何も残りません。"
        }
      ]
    },
    "faq": {
      "heading": "よくある質問",
      "items": [
        {
          "id": "1",
          "question": "このビフォーアフター写真メーカーは無料ですか？",
          "answer": "はい。アップロード、比較、文字入れ、書き出しのすべてが無料で、ウォーターマークもアカウント登録もありません。作れる枚数の上限もありません。"
        },
        {
          "id": "2",
          "question": "写真は安全に扱われますか？",
          "answer": "はい。2枚ともブラウザ内だけでデコード・合成されます。サーバーへ送信されることはなく、タブを閉じれば何も残りません。"
        },
        {
          "id": "3",
          "question": "レイアウトは何種類ありますか？",
          "answer": "4種類です。ドラッグできるスライダー、並べて、細い境界線で区切った分割、上下に重ねた配置。写真を上げ直さずにいつでも切り替えられます。"
        },
        {
          "id": "4",
          "question": "アニメーションGIFは書き出せますか？",
          "answer": "はい、スライダーのレイアウトで書き出せます。境界線が画面を往復してループします。他の3つは静止したレイアウトなので、PNGでの書き出しになります。"
        },
        {
          "id": "5",
          "question": "書き出すPNGのスライダー位置は指定できますか？",
          "answer": "はい。変化が一番よく伝わる位置に境界線をドラッグすれば、その位置のままPNGに書き出されます。GIFの書き出しは、どこで止めていても全範囲を往復します。"
        },
        {
          "id": "6",
          "question": "2枚の構図がそろっていない場合は？",
          "answer": "「位置合わせ」を開いてください。アフター写真が半透明でビフォーに重なるので、目印が合うまでドラッグ・拡大縮小・回転できます。調整はすべてのレイアウトと書き出しに反映されます。"
        },
        {
          "id": "7",
          "question": "比較に文字を入れられますか？",
          "answer": "はい。文字を追加して画面上の好きな位置へドラッグでき、サイズと色も設定できます。長い文字は画面からはみ出さずに折り返します。空のままなら何も描画されません。"
        },
        {
          "id": "8",
          "question": "どの画像形式をアップロードできますか？",
          "answer": "PNG・JPG・WEBPに対応しています。書き出しはフル解像度のPNG、GIFボタンを使った場合はフィードやチャット向けのサイズになります。"
        }
      ]
    },
    "finalCta": {
      "heading": "ビフォーアフターを作る",
      "body": "2枚の写真をアップして、一番伝わるレイアウトを選び、PNGかループGIFでダウンロード。アカウント不要、ウォーターマークなし。",
      "cta": {
        "text": "比較をはじめる",
        "href": null
      }
    }
  },
  "id": {
    "name": "Pembuat Foto Before & After",
    "meta": {
      "title": "Pembuat Foto Before & After Gratis | Slider, GIF & Berdampingan",
      "description": "Ubah dua foto jadi before and after: slider geser, berdampingan, terbelah, atau bertumpuk. Sejajarkan foto, tambah teks, ekspor PNG atau GIF berulang. Gratis, tanpa watermark.",
      "ogTitle": "",
      "ogDescription": ""
    },
    "hero": {
      "headline": "Pembuat Foto Before & After",
      "subheadline": "Unggah dua foto dan tunjukkan perubahannya dengan empat cara — slider yang bisa digeser, berdampingan, terbelah, atau bertumpuk. Sejajarkan fotonya, tambahkan teks, lalu ekspor PNG atau GIF berulang.",
      "image": null,
      "cta": {
        "text": "Bandingkan Dua Foto",
        "href": null
      },
      "formats": []
    },
    "toolLinks": {
      "lead": "",
      "items": [
        {
          "id": "1",
          "label": "Pembuat Kutipan Foto",
          "href": "/photo-quote-maker"
        },
        {
          "id": "2",
          "label": "Editor Overlay Foto",
          "href": "/photo-overlay-editor"
        },
        {
          "id": "3",
          "label": "Pembuat Polkadot",
          "href": "/polka-dot"
        }
      ]
    },
    "features": [
      {
        "id": "1",
        "heading": "Empat Tata Letak dari Sepasang Foto",
        "body": "Dua foto yang sama bisa jadi slider yang digeser, sepasang foto berdampingan, satu bingkai terbelah dengan garis tipis, atau satu foto bertumpuk di atas yang lain. Berpindah sesering apa pun tidak mengunggah ulang apa pun dan tidak menghilangkan pengaturan, jadi Anda bisa melihat mana yang paling mengena sebelum memutuskan.",
        "image": null,
        "cta": null
      },
      {
        "id": "2",
        "heading": "Ekspor GIF Berulang, Bukan Cuma Gambar Diam",
        "body": "Pada tata letak slider, satu tombol menyapukan garis pembatas ke ujung dan kembali lagi, lalu mengemasnya jadi GIF berulang. Perbandingannya berjalan sendiri — persis yang Anda butuhkan di feed atau ruang obrolan, tempat tak ada yang akan menggeser apa pun. Proses encoding terjadi di perangkat Anda, tanpa unggahan dan tanpa antrean.",
        "image": null,
        "cta": null
      },
      {
        "id": "3",
        "heading": "Sejajarkan Foto yang Sudutnya Tidak Sama",
        "body": "Dua foto yang diambil berminggu-minggu terpisah jarang punya komposisi identik. Mode Align menumpuk foto after di atas foto before dengan separuh transparansi, jadi Anda bisa menggeser, memperbesar, dan memutarnya sampai titik tetap — kusen pintu, bahu, garis cakrawala — benar-benar bertemu. Penyesuaiannya ikut ke semua tata letak dan ke hasil ekspor.",
        "image": null,
        "cta": null
      },
      {
        "id": "4",
        "heading": "Taruh Teks di Mana Saja pada Bingkai",
        "body": "Tambahkan teks singkat lalu geser ke tempat yang paling pas — menimpa sisi before, menyusuri bagian bawah, atau menyingkir ke sudut. Ukuran dan warnanya Anda yang tentukan, dan teks panjang membungkus di dalam bingkai alih-alih keluar dari tepi. Biarkan kosong dan tidak ada teks yang digambar.",
        "image": null,
        "cta": null
      },
      {
        "id": "5",
        "heading": "Ekspor Gratis, Tanpa Watermark, Tanpa Unggahan",
        "body": "Kedua foto diproses dan disusun di dalam peramban Anda. Tidak ada yang sampai ke server, tidak ada yang disimpan setelahnya, dan tidak ada yang dicap ke hasilnya — hal yang paling terasa saat perbandingannya melibatkan klien, pasien, atau wajah Anda sendiri. Ekspor sesering yang Anda mau, tanpa akun.",
        "image": null,
        "cta": null
      }
    ],
    "howTo": {
      "heading": "Cara Membuat Foto Before & After",
      "steps": [
        {
          "id": "1",
          "heading": "Unggah Foto Before",
          "body": "Pilih foto yang lebih dulu diambil — titik awal yang ingin Anda bandingkan. Foto itu tetap di perangkat Anda."
        },
        {
          "id": "2",
          "heading": "Unggah Foto After",
          "body": "Tambahkan foto yang lebih baru. Keduanya otomatis dipaskan ke bingkai yang sama; kalau komposisinya meleset, buka Align dan geser foto after ke posisinya."
        },
        {
          "id": "3",
          "heading": "Pilih Tata Letak lalu Ekspor",
          "body": "Pilih slider, berdampingan, terbelah, atau bertumpuk, tambahkan teks kalau perlu, lalu unduh PNG — atau GIF berulang kalau Anda bertahan di slider."
        }
      ]
    },
    "why": {
      "heading": "Kenapa Memakai Pembuat Foto Before & After Ini?",
      "cards": [
        {
          "id": "1",
          "heading": "Satu Geseran, Bukan Dua Foto untuk Dibandingkan",
          "body": "Slider mengerjakan perbandingannya untuk penonton, alih-alih membiarkan mereka bolak-balik antara dua gambar terpisah."
        },
        {
          "id": "2",
          "heading": "GIF Membandingkan Dirinya Sendiri",
          "body": "Di feed atau obrolan grup, tak ada yang menggeser apa pun. GIF berulang menyapukan pembatasnya sendiri, jadi perubahannya sampai tanpa perlu interaksi."
        },
        {
          "id": "3",
          "heading": "Penyejajaran Sudah Termasuk",
          "body": "Kebanyakan alat perbandingan menganggap dua foto Anda sudah berkomposisi sama. Yang ini membiarkan Anda menggeser, memperbesar, dan memutar foto after sampai keduanya cocok."
        },
        {
          "id": "4",
          "heading": "Privat Sejak Awal",
          "body": "Foto diproses dan disusun hanya di perangkat Anda — tidak ada yang diunggah ke server, dan tidak ada yang tersisa setelahnya."
        }
      ]
    },
    "faq": {
      "heading": "Tanya Jawab",
      "items": [
        {
          "id": "1",
          "question": "Apakah pembuat foto before and after ini gratis?",
          "answer": "Ya. Mengunggah, membandingkan, menambah teks, dan mengekspor semuanya gratis, tanpa watermark dan tanpa perlu akun. Tidak ada batas berapa banyak perbandingan yang Anda buat."
        },
        {
          "id": "2",
          "question": "Apakah foto saya aman dan privat?",
          "answer": "Ya. Kedua foto diproses dan disusun sepenuhnya di dalam peramban Anda. Foto tidak pernah diunggah ke server, dan tidak ada yang tersimpan begitu tab ditutup."
        },
        {
          "id": "3",
          "question": "Tata letak apa saja yang bisa dipilih?",
          "answer": "Ada empat: slider yang bisa digeser, berdampingan, bingkai terbelah dengan garis tipis, dan satu foto bertumpuk di atas yang lain. Anda bisa berpindah kapan saja tanpa mengunggah ulang."
        },
        {
          "id": "4",
          "question": "Bisakah saya mengekspor GIF beranimasi?",
          "answer": "Bisa, pada tata letak slider. GIF-nya menyapukan pembatas melintasi bingkai lalu kembali dan berulang. Tiga tata letak lainnya adalah susunan diam, jadi diekspor sebagai PNG."
        },
        {
          "id": "5",
          "question": "Bisakah saya mengatur posisi slider pada PNG hasil ekspor?",
          "answer": "Bisa. Geser pembatas ke posisi yang paling menunjukkan perubahannya, dan PNG-nya merekam posisi itu persis. Ekspor GIF tetap menyapu seluruh rentang, di mana pun Anda meninggalkannya."
        },
        {
          "id": "6",
          "question": "Bagaimana kalau komposisi dua foto saya tidak sama?",
          "answer": "Buka Align. Foto after ditumpuk di atas foto before dengan separuh transparansi, jadi Anda bisa menggeser, memperbesar, dan memutarnya sampai titik tetapnya bertemu. Penyesuaiannya berlaku untuk semua tata letak dan untuk hasil ekspor."
        },
        {
          "id": "7",
          "question": "Bisakah saya menambahkan teks ke perbandingannya?",
          "answer": "Bisa. Tambahkan teks, geser ke mana saja pada bingkai, lalu atur ukuran dan warnanya. Teks panjang membungkus di dalam bingkai alih-alih keluar dari tepi. Kalau dibiarkan kosong, tidak ada teks yang digambar."
        },
        {
          "id": "8",
          "question": "Format gambar apa saja yang bisa diunggah?",
          "answer": "PNG, JPG, dan WEBP. Hasil ekspor berupa PNG resolusi penuh, atau GIF berukuran pas untuk feed dan aplikasi obrolan kalau Anda memakai tombol GIF."
        }
      ]
    },
    "finalCta": {
      "heading": "Buat Before & After Anda",
      "body": "Unggah dua foto, pilih tata letak yang paling bercerita, lalu unduh PNG atau GIF berulang — tanpa akun, tanpa watermark.",
      "cta": {
        "text": "Mulai Membandingkan",
        "href": null
      }
    }
  }
};

export default content;
